import { useEffect, useRef, useMemo } from 'react';
import useSession from '../hooks/useSession';
import ChatBubble from '../components/chat/ChatBubble';
import UserBubble from '../components/chat/UserBubble';
import QuickReplyChips from '../components/chat/QuickReplyChips';
import MenuCard from '../components/chat/MenuCard';
import OrderSummary from '../components/chat/OrderSummary';
import CheckoutPrompt from '../components/chat/CheckoutPrompt';
import MessageInput from '../components/chat/MessageInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import styles from './ChatPage.module.css';

// Main chat page component that renders the chat interface, messages, and input
export default function ChatPage() {
  const { messages, loading, initializing, send, pay } = useSession();
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Find the last message that has options (for quick reply chips)
  const lastOptionsIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'bot' && messages[i].options?.length > 0) {
        return i;
      }
    }
    return -1;
  }, [messages]);

  const renderMessage = (msg, index) => {
    const isLastBotWithOptions = index === lastOptionsIndex;

    if (msg.sender === 'user') {
      return (
        <div key={msg.id} className={styles.messageRow}>
          <UserBubble text={msg.text} />
        </div>
      );
    }

    // Bot message
    return (
      <div key={msg.id} className={styles.messageGroup}>
        {/* Text bubble (always show unless it's purely a menu/order response) */}
        {msg.text && msg.type !== 'menu' && msg.type !== 'order' && msg.type !== 'checkout' && (
          <ChatBubble text={msg.text} />
        )}

        {/* Menu type: show text + menu cards */}
        {msg.type === 'menu' && (
          <>
            <ChatBubble text={msg.text} />
            <div className={styles.menuGrid}>
              {msg.data.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={(menuItem) => send(String(menuItem.id))}
                />
              ))}
            </div>
          </>
        )}

        {/* Order type: show text + order summary */}
        {msg.type === 'order' && (
          <>
            <ChatBubble text={msg.text} />
            <OrderSummary data={msg.data} />
          </>
        )}

        {/* Checkout type: show order summary + pay button */}
        {msg.type === 'checkout' && (
          <>
            <ChatBubble text={msg.text} />
            {msg.data && <OrderSummary data={msg.data} />}
            <CheckoutPrompt text="Ready to pay for your order?" onPay={pay} loading={loading} />
          </>
        )}

        {/* Quick reply chips - only on the last bot message that has options */}
        {isLastBotWithOptions && (
          <QuickReplyChips options={msg.options} onSelect={send} />
        )}
      </div>
    );
  };

  if (initializing) {
    return (
      <div className={styles.shell}>
        <div className={styles.header}>
          <div className={styles.headerAvatar}>🍔</div>
          <div>
            <h1 className={styles.headerTitle}>ChopBot</h1>
            <p className={styles.headerSubtitle}>Online</p>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <TypingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerAvatar}>🍔</div>
        <div>
          <h1 className={styles.headerTitle}>ChopBot</h1>
          <p className={styles.headerSubtitle}>
            {loading ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={scrollRef}>
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={send} disabled={loading} />
    </div>
  );
}
