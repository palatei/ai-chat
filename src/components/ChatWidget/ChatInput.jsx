import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { IconAttach, IconMic, IconSend } from './icons.jsx';
import styles from './ChatWidget.module.css';

export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const committedRef = useRef('');

  const appendFinalText = useCallback((text) => {
    setValue((prev) => {
      const base = prev.trimEnd();
      const next = base ? `${base} ${text}` : text;
      committedRef.current = next;
      return next;
    });
  }, []);

  const showInterim = useCallback((interim) => {
    setValue(() => {
      const base = committedRef.current.trimEnd();
      return base ? `${base} ${interim}` : interim;
    });
  }, []);

  const {
    isSupported,
    isListening,
    error: voiceError,
    toggleListening,
    stopListening,
    clearError,
  } = useSpeechRecognition({
    lang: 'ru-RU',
    onFinalTranscript: appendFinalText,
    onInterimTranscript: showInterim,
  });

  useEffect(() => {
    committedRef.current = value;
  }, [value]);

  useEffect(() => {
    if (disabled && isListening) {
      stopListening();
    }
  }, [disabled, isListening, stopListening]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    stopListening();
    onSend(value);
    setValue('');
    committedRef.current = '';
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onVoiceClick = () => {
    clearError();
    if (!isListening) {
      committedRef.current = value;
    }
    toggleListening();
  };

  const placeholder = isListening ? 'Слушаю… говорите' : 'Напишите или скажите сообщение…';

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
      {isSupported && (
        <button
          type="button"
          className={`${styles.voiceBtn} ${isListening ? styles.voiceBtnActive : ''}`}
          onClick={onVoiceClick}
          disabled={disabled}
          aria-label={isListening ? 'Остановить запись' : 'Голосовой ввод'}
          aria-pressed={isListening}
          title={isListening ? 'Остановить' : 'Голосовой ввод'}
        >
          <IconMic />
        </button>
      )}
      <div className={styles.inputFieldWrap}>
        <textarea
          className={styles.textInput}
          rows={1}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            committedRef.current = e.target.value;
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          aria-label="Текст сообщения"
        />
        {voiceError && (
          <p className={styles.voiceError} role="status">
            {voiceError}
          </p>
        )}
      </div>
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
