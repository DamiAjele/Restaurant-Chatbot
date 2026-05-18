import styles from './CheckoutPrompt.module.css';

// Component for showing a checkout prompt with a "Pay Now" button
export default function CheckoutPrompt({ text, onPay, loading }) {
  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.prompt}>
        <p className={styles.text}>{text || 'Ready to checkout?'}</p>
      </div>
      <button
        className={styles.payBtn}
        onClick={onPay}
        disabled={loading}
        aria-label="Pay now"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>{loading ? 'Processing...' : 'Pay Now'}</span>
      </button>
    </div>
  );
}
