import { IconChat, IconClose } from './icons.jsx';
import styles from './ChatWidget.module.css';

export function LauncherButton({ onClick, unreadCount, preview, isOpen }) {
  return (
    <div className={styles.launcherWrap}>
      {!isOpen && preview && (
        <button type="button" className={styles.previewTeaser} onClick={onClick}>
          <span className={styles.previewText}>{preview}</span>
        </button>
      )}
      <button
        type="button"
        className={styles.launcher}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Закрыть чат' : 'Открыть чат с ассистентом'}
      >
        {isOpen ? (
          <IconClose size={26} />
        ) : (
          <>
            <IconChat size={28} />
            {unreadCount > 0 && (
              <span className={styles.badge} aria-label={`${unreadCount} непрочитанных`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
