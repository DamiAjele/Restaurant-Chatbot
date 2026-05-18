import styles from './MenuCard.module.css';

// Component for displaying a menu item card with image, name, description, price, and "Add" button
export default function MenuCard({ item, onAdd }) {
  const price = typeof item.price === 'number'
    ? `$${(item.price / 100).toFixed(2)}`
    : `$${item.price}`;

  return (
    <div className={`${styles.card} animate-fade-in`}>
      {item.imageUrl && (
        <div className={styles.imageContainer}>
          <img
            src={item.imageUrl}
            alt={item.name}
            className={styles.image}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>{price}</span>
          <button
            className={styles.addBtn}
            onClick={() => onAdd(item)}
            title={`Add ${item.name} to order`}
            aria-label={`Add ${item.name} to order`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
