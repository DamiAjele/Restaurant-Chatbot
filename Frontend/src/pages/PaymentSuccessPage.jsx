import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../api/client';
import CheckCircle from '../assets/check-circle.svg?react';
import styles from './PaymentSuccessPage.module.css';

// Page component for displaying payment success, order summary, and handling payment verification
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [orderData, setOrderData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setErrorMsg('No payment reference found.');
      return;
    }

    let cancelled = false;
    async function verify() {
      try {
        const result = await verifyPayment(reference);
        if (cancelled) return;
        if (result.success) {
          setStatus('success');
          setOrderData(result.order || result.data || null);
        } else {
          setStatus('error');
          setErrorMsg(result.message || 'Payment verification failed.');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Payment verification error:', err);
          setStatus('error');
          setErrorMsg('Could not verify payment. Please contact support.');
        }
      }
    }
    verify();
    return () => { cancelled = true; };
  }, [reference]);

  const handleNewOrder = () => {
    navigate('/');
  };

  const formatPrice = (price) => {
    if (price == null) return '$0.00';
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (num >= 100) return `$${(num / 100).toFixed(2)}`;
    return `$${num.toFixed(2)}`;
  };

  if (status === 'verifying') {
    return (
      <div className={styles.shell}>
        <div className={styles.container}>
          <div className={styles.loadingSpinner} />
          <h1 className={styles.heading}>Verifying Payment...</h1>
          <p className={styles.subtitle}>Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.shell}>
        <div className={styles.container}>
          <div className={styles.errorIcon}>✕</div>
          <h1 className={styles.heading}>Payment Issue</h1>
          <p className={styles.subtitle}>{errorMsg}</p>
          <button className={styles.actionBtn} onClick={handleNewOrder}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Start New Order</span>
          </button>
        </div>
      </div>
    );
  }

  const items = orderData?.items || orderData?.orderItems || [];
  const orderId = orderData?.id || reference?.slice(-4) || '0000';
  const total = orderData?.total || orderData?.totalAmount;

  return (
    <div className={styles.shell}>
      <div className={`${styles.container} animate-fade-in`}>
        {/* Success Icon */}
        <div className={`${styles.successIcon} animate-scale-in`}>
          <CheckCircle width={32} height={32} aria-hidden="true" />
        </div>

        {/* Title */}
        <h1 className={styles.heading}>Payment Successful!</h1>
        <p className={styles.emoji}>🎉</p>
        <p className={styles.subtitle}>
          Your order #{orderId} is being prepared and{'\n'}will be ready in 20 minutes.
        </p>

        {/* Order Summary Card */}
        {items.length > 0 && (
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.itemsList}>
              {items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <div className={styles.itemLeft}>
                    {(item.menuItem?.imageUrl || item.imageUrl) && (
                      <img
                        src={item.menuItem?.imageUrl || item.imageUrl}
                        alt={item.menuItem?.name || item.name}
                        className={styles.itemImage}
                      />
                    )}
                    <span className={styles.itemName}>
                      {item.quantity || 1}x {item.menuItem?.name || item.name}
                    </span>
                  </div>
                  <span className={styles.itemPrice}>
                    {formatPrice(item.price || item.menuItem?.price)}
                  </span>
                </div>
              ))}
            </div>
            {total != null && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Paid</span>
                <span className={styles.totalValue}>{formatPrice(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button className={styles.actionBtn} onClick={handleNewOrder}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Start New Order</span>
        </button>
      </div>
    </div>
  );
}
