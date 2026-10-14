import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../hooks/useChat.js';
import { mockAgent, mockQuickReplies } from '../../mocks/agent.js';
import { ChatBackground3D } from './ChatBackground3D.jsx';
import { ChatHeader } from './ChatHeader.jsx';
import { ChatInput } from './ChatInput.jsx';
import { LauncherButton } from './LauncherButton.jsx';
import { MessageBubble } from './MessageBubble.jsx';
import { QuickReplies } from './QuickReplies.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import styles from './ChatWidget.module.css';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    messages,
    isTyping,
    unreadCount,
    lastMessagePreview,
    sendMessage,
    markAllRead,
  } = useChat();
  const listRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  const openChat = () => {
    setIsOpen(true);
    markAllRead();
  };

  const closeChat = () => setIsOpen(false);

  const toggleChat = () => {
    if (isOpen) closeChat();
    else openChat();
  };

  const handleSend = (text) => {
    sendMessage(text, { markRead: isOpen });
    if (!isOpen) return;
    markAllRead();
  };

  const showQuickReplies = !isTyping && messages.length <= 6;

  return (
    <div className={styles.widgetRoot}>
      {isOpen && (
        <section className={styles.panel} aria-label="Окно чата с ассистентом">
          <ChatHeader agent={mockAgent} onMinimize={closeChat} onClose={closeChat} />
          <div className={styles.messagesWrap} ref={listRef}>
            <ChatBackground3D />
            <div className={styles.messagesInner}>
              <p className={styles.chatDisclaimer}>
                Ответы генерирует ИИ-ассистент на базе Gemini через backend приложения.
              </p>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  agentInitials={mockAgent.initials}
                />
              ))}
              {isTyping && <TypingIndicator agentInitials={mockAgent.initials} />}
            </div>
          </div>
          {showQuickReplies && (
            <QuickReplies
              items={mockQuickReplies}
              onSelect={handleSend}
              disabled={isTyping}
            />
          )}
          <ChatInput onSend={handleSend} disabled={isTyping} />
          <footer className={styles.poweredBy}>Powered by Gemini</footer>
        </section>
      )}

      <LauncherButton
        isOpen={isOpen}
        onClick={toggleChat}
        unreadCount={unreadCount}
        preview={lastMessagePreview}
      />
    </div>
  );
}
