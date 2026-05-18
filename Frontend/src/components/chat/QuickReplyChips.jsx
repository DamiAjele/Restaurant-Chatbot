import styles from './QuickReplyChips.module.css';

// Component for displaying quick reply chips based on options provided by the bot
export default function QuickReplyChips({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  // Filter out the "Reply with:" label
  const chips = options.filter(
    (opt) => !opt.toLowerCase().startsWith('reply with')
  );

  // Parse options like "1 - View Menu" or "99 - Checkout"
  const parseChip = (option) => {
    const match = option.match(/^(\d+)\s*[-–]\s*(.+)$/);
    if (match) {
      return { code: match[1], label: `${match[1]} - ${match[2].trim()}` };
    }
    return { code: option, label: option };
  };

  return (
    <div className={`${styles.container} animate-fade-in`} role="group" aria-label="Quick reply options">
      {chips.map((option, idx) => {
        const { code, label } = parseChip(option);
        return (
          <button
            key={idx}
            className={styles.chip}
            onClick={() => onSelect(code)}
            title={label}
            aria-label={label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
