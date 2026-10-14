import { useCallback, useMemo, useRef, useState } from 'react';
import { requestChatReply } from '../api/chatClient.js';
import { mockInitialMessages } from '../mocks/messages.js';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChat() {
  const [messages, setMessages] = useState(mockInitialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const requestIdRef = useRef(0);

  const sendMessage = useCallback(
    async (text, { markRead = true } = {}) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMessage = {
        id: createId('user'),
        role: 'user',
        text: trimmed,
        createdAt: new Date().toISOString(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'delivered' } : m)),
        );
      }, 400);

      setIsTyping(true);
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        const historyForApi = [...messages, userMessage]
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({ role: m.role, text: m.text }));

        const replyText = await requestChatReply(historyForApi);

        if (requestIdRef.current !== requestId) return;

        const assistantMessage = {
          id: createId('assistant'),
          role: 'assistant',
          text: replyText,
          createdAt: new Date().toISOString(),
          status: 'read',
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (!markRead) {
          setUnreadCount((c) => c + 1);
        }
      } catch (err) {
        if (requestIdRef.current !== requestId) return;

        const assistantMessage = {
          id: createId('assistant'),
          role: 'assistant',
          text:
            err instanceof Error
              ? err.message
              : 'Произошла ошибка при отправке сообщения. Попробуйте ещё раз.',
          createdAt: new Date().toISOString(),
          status: 'read',
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (!markRead) {
          setUnreadCount((c) => c + 1);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsTyping(false);
        }
      }
    },
    [isTyping, messages],
  );

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const lastMessagePreview = useMemo(() => {
    const last = messages[messages.length - 1];
    if (!last) return '';
    const prefix = last.role === 'user' ? 'Вы: ' : '';
    const text = last.text.length > 48 ? `${last.text.slice(0, 48)}…` : last.text;
    return `${prefix}${text}`;
  }, [messages]);

  return {
    messages,
    isTyping,
    unreadCount,
    lastMessagePreview,
    sendMessage,
    markAllRead,
  };
}
