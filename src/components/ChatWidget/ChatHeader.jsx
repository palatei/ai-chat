import { useTheme } from '../../context/ThemeContext.jsx';
import { IconClose, IconMinimize, IconMoon, IconSun } from './icons.jsx';
import styles from './ChatWidget.module.css';

export function ChatHeader({ agent, onMinimize, onClose }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.headerMain}>
        <div className={styles.headerAvatar}>{agent.initials}</div>
        <div className={styles.headerInfo}>
          <span className={styles.headerName}>{agent.name}</span>
          <span className={styles.headerStatus}>
            <span className={styles.onlineDot} aria-hidden />
            {agent.statusLabel}
          </span>
        </div>
      </div>
      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>
        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={onMinimize}
          aria-label="Свернуть чат"
        >
          <IconMinimize />
        </button>
        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={onClose}
          aria-label="Закрыть чат"
        >
          <IconClose />
        </button>
      </div>
    </header>
  );
}
