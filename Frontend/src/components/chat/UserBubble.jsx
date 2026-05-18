import styles from './UserBubble.module.css';

// Simple chat bubble component for user messages
export default function UserBubble({ text }) {
  return (
    <div className={`${styles.bubble} animate-fade-in`}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
