import styles from './ChatWidget.module.css';

export function QuickReplies({ items, onSelect, disabled }) {
  if (!items?.length) return null;

  return (
    <div className={styles.quickReplies} role="group" aria-label="Быстрые ответы">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={styles.quickReplyBtn}
          disabled={disabled}
          onClick={() => onSelect(item.label)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
