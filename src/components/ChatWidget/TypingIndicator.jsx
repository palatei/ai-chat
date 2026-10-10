import styles from './ChatWidget.module.css';

export function TypingIndicator({ agentInitials }) {
  return (
    <div className={`${styles.messageRow} ${styles.messageRowAgent}`} aria-live="polite">
      <div className={styles.messageAvatar} aria-hidden>
        {agentInitials}
      </div>
      <div className={styles.typingBubble}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.srOnly}>Ассистент печатает…</span>
      </div>
    </div>
  );
}
