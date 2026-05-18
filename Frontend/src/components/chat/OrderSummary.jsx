import styles from './OrderSummary.module.css';

// Component for displaying an order summary with items, quantities, prices, and total
export default function OrderSummary({ data, showTotal = true }) {
  if (!data) return null;

  const items = data.items || data.orderItems || (Array.isArray(data) ? data : []);
  const total = data.total || data.totalAmount;

  if (items.length === 0) return null;

  const formatPrice = (price) => {
    const num = typeof price === 'number' ? price : parseFloat(price);
    if (num >= 100) return `$${(num / 100).toFixed(2)}`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className={`${styles.card} animate-fade-in`}>
      <h4 className={styles.title}>ORDER SUMMARY</h4>
      <div className={styles.items}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.item}>
            <div className={styles.itemLeft}>
              {item.menuItem?.imageUrl && (
                <img
                  src={item.menuItem.imageUrl}
                  alt={item.menuItem?.name || item.name}
                  className={styles.itemImage}
                />
              )}
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>
                  {item.quantity || 1}x {item.menuItem?.name || item.name}
                </span>
                {item.menuItem?.category && (
                  <span className={styles.itemCategory}>{item.menuItem.category}</span>
                )}
              </div>
            </div>
            <span className={styles.itemPrice}>
              {formatPrice(item.price || item.menuItem?.price)}
            </span>
          </div>
        ))}
      </div>
      {showTotal && total != null && (
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>{formatPrice(total)}</span>
        </div>
      )}
    </div>
  );
}
