import styles from './TypingIndicator.module.css';

// Component for showing a typing indicator (animated dots) when the bot is "typing"
export default function TypingIndicator() {
  return (
    <div className={`${styles.bubble} animate-fade-in`} aria-label="Bot is typing">
      <div className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}
