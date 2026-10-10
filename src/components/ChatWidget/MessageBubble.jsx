import styles from './ChatWidget.module.css';

function formatTime(iso) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function MessageBubble({ message, agentInitials }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className={styles.systemMessage} role="status">
        {message.text}
      </div>
    );
  }

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAgent}`}
    >
      {!isUser && (
        <div className={styles.messageAvatar} aria-hidden>
          {agentInitials}
        </div>
      )}
      <div className={styles.messageContent}>
        <div
          className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAgent}`}
        >
          <p className={styles.bubbleText}>{message.text}</p>
        </div>
        <span className={styles.messageMeta}>
          {formatTime(message.createdAt)}
          {isUser && message.status === 'delivered' && ' · доставлено'}
        </span>
      </div>
    </div>
  );
}
