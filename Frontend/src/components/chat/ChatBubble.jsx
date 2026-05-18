import styles from './ChatBubble.module.css';

// Simple chat bubble component for bot messages
export default function ChatBubble({ text }) {
  return (
    <div className={`${styles.bubble} animate-fade-in`}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
