import { useCallback, useMemo, useRef, useState } from 'react';
import { mockAgentReplies, mockInitialMessages } from '../mocks/messages.js';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function findReply(text) {
  const normalized = text.trim().toLowerCase();
  for (const [key, reply] of Object.entries(mockAgentReplies)) {
    if (key !== 'default' && normalized.includes(key)) {
      return reply;
    }
  }
  return mockAgentReplies.default;
}

const TYPING_DELAY_MS = 900;
const REPLY_DELAY_MS = 1400;

export function useChat() {
  const [messages, setMessages] = useState(mockInitialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);

  const clearPending = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    (text, { markRead = true } = {}) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      clearPending();

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

      timerRef.current = setTimeout(() => {
        const assistantMessage = {
          id: createId('assistant'),
          role: 'assistant',
          text: findReply(trimmed),
          createdAt: new Date().toISOString(),
          status: 'read',
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
        if (!markRead) {
          setUnreadCount((c) => c + 1);
        }
      }, REPLY_DELAY_MS + TYPING_DELAY_MS);
    },
    [clearPending],
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
