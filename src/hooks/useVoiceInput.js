import { useCallback, useEffect, useRef, useState } from 'react';
import { requestSpeechTranscription } from '../api/transcribeClient.js';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function pickRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

/**
 * @param {{ lang?: string, onFinalTranscript?: (text: string) => void, onInterimTranscript?: (text: string) => void }} options
 */
export function useVoiceInput({
  lang = 'ru-RU',
  onFinalTranscript,
  onInterimTranscript,
} = {}) {
  const [hasSpeechApi, setHasSpeechApi] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const callbacksRef = useRef({ onFinalTranscript, onInterimTranscript });

  useEffect(() => {
    callbacksRef.current = { onFinalTranscript, onInterimTranscript };
  }, [onFinalTranscript, onInterimTranscript]);

  useEffect(() => {
    setHasSpeechApi(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const stopBrowserRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      setIsListening(false);
      stopMediaStream();
    }
  }, [stopMediaStream]);

  const startBrowserRecognition = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

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
      return true;
    } catch {
      setError('Микрофон уже используется или распознавание уже запущено.');
      setIsListening(false);
      return false;
    }
  }, [lang]);

  const startRecording = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined') {
      setError('Запись голоса не поддерживается в этом браузере.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickRecorderMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        stopMediaStream();

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        chunksRef.current = [];

        if (blob.size < 800) {
          setError('Запись слишком короткая. Удерживайте микрофон и говорите дольше.');
          return;
        }

        setIsProcessing(true);
        setError(null);
        try {
          const text = await requestSpeechTranscription(blob);
          if (text) {
            callbacksRef.current.onFinalTranscript?.(text);
          } else {
            setError('Речь не распознана. Попробуйте громче или ближе к микрофону.');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ошибка распознавания на сервере.');
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      setIsListening(true);
    } catch {
      setError('Не удалось получить доступ к микрофону.');
      stopMediaStream();
      setIsListening(false);
    }
  }, [stopMediaStream]);

  const startListening = useCallback(async () => {
    setError(null);
    if (hasSpeechApi) {
      startBrowserRecognition();
      return;
    }
    await startRecording();
  }, [hasSpeechApi, startBrowserRecognition, startRecording]);

  const stopListening = useCallback(() => {
    if (hasSpeechApi && recognitionRef.current) {
      stopBrowserRecognition();
      return;
    }
    stopRecording();
  }, [hasSpeechApi, stopBrowserRecognition, stopRecording]);

  const toggleListening = useCallback(() => {
    if (isProcessing) return;
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  }, [isListening, isProcessing, startListening, stopListening]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop();
      }
      stopMediaStream();
    },
    [stopMediaStream],
  );

  return {
    hasSpeechApi,
    isListening,
    isProcessing,
    error,
    toggleListening,
    stopListening,
    clearError: () => setError(null),
  };
}
