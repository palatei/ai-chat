import { useCallback, useEffect, useRef, useState } from 'react';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * @param {{ lang?: string, onFinalTranscript?: (text: string) => void, onInterimTranscript?: (text: string) => void }} options
 */
export function useSpeechRecognition({
  lang = 'ru-RU',
  onFinalTranscript,
  onInterimTranscript,
} = {}) {
  const [isSupported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const callbacksRef = useRef({ onFinalTranscript, onInterimTranscript });

  useEffect(() => {
    callbacksRef.current = { onFinalTranscript, onInterimTranscript };
  }, [onFinalTranscript, onInterimTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError('Голосовой ввод не поддерживается в этом браузере (нужен Chrome или Edge).');
      return;
    }

    setError(null);

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      const messages = {
        'not-allowed': 'Разрешите доступ к микрофону в настройках браузера.',
        'service-not-allowed': 'Голосовой ввод недоступен (HTTPS или разрешения).',
        network: 'Ошибка сети при распознавании речи.',
      };
      setError(messages[event.error] || 'Не удалось распознать речь. Попробуйте ещё раз.');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interim += chunk;
        }
      }

      if (interim) {
        callbacksRef.current.onInterimTranscript?.(interim.trim());
      }
      if (finalText.trim()) {
        callbacksRef.current.onFinalTranscript?.(finalText.trim());
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError('Микрофон уже используется или распознавание уже запущено.');
      setIsListening(false);
    }
  }, [lang]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
    },
    [],
  );

  return {
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null),
  };
}
