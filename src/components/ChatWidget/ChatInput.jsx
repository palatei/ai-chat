import { useState } from 'react';
import { IconAttach, IconSend } from './icons.jsx';
import styles from './ChatWidget.module.css';

export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.inputArea}>
      <button
        type="button"
        className={styles.iconBtnMuted}
        aria-label="Прикрепить файл (скоро)"
        disabled
        title="Скоро"
      >
        <IconAttach />
      </button>
      <textarea
        className={styles.textInput}
        rows={1}
        placeholder="Напишите сообщение…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-label="Текст сообщения"
      />
      <button
        type="button"
        className={styles.sendBtn}
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Отправить"
      >
        <IconSend />
      </button>
    </div>
  );
}
