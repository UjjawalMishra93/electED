/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, ExternalLink, Minimize2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useChatStore } from '@/store';
import type { ChatMessage, Source } from '@/types';
import styles from './FloatingChat.module.css';

const API_URL = 'http://127.0.0.1:5001/elected-hackathon/us-central1/chat';

const QUICK_CHIPS = [
  { label: 'Register to vote', q: 'How do I register to vote?' },
  { label: 'Electoral College', q: 'What is the Electoral College?' },
  { label: 'Absentee ballot', q: 'How do I request an absentee ballot?' },
];

const MOCK_RESPONSES: Record<string, { content: string; sources: Source[] }> = {
  register: {
    content:
      "To register to vote: (1) Check you meet your state's requirements, (2) visit vote.gov to register online, by mail, or in person. Deadlines vary by state!",
    sources: [{ label: 'Vote.gov', url: 'https://vote.gov' }],
  },
  electoral: {
    content:
      "The Electoral College has 538 electors. A candidate needs 270+ electoral votes to win the presidency. Each state's electoral votes equal its Congressional seats.",
    sources: [{ label: 'USA.gov', url: 'https://usa.gov/electoral-college' }],
  },
  absentee: {
    content:
      "Request an absentee ballot through your state's election website. Deadlines vary — apply early! Many states let you track your mail ballot status online.",
    sources: [{ label: 'Vote.gov', url: 'https://vote.gov/absentee-voting/' }],
  },
};

function getMockResponse(query: string) {
  const lower = query.toLowerCase();
  if (lower.includes('register')) return MOCK_RESPONSES.register;
  if (lower.includes('electoral') || lower.includes('college')) return MOCK_RESPONSES.electoral;
  if (lower.includes('absentee') || lower.includes('mail')) return MOCK_RESPONSES.absentee;
  return {
    content:
      "I'm a quick preview of ElectEd AI! For full conversation history and more features, open the full chat.",
    sources: [{ label: 'Vote.gov', url: 'https://vote.gov' }],
  };
}

/** Format **bold** markdown to <strong> */
function format(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

const MiniMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isAI = msg.role === 'assistant';
  return (
    <div className={`${styles.miniMsg} ${isAI ? styles.miniMsgAI : styles.miniMsgUser}`}>
      {isAI && (
        <div className={styles.miniAvatar} aria-hidden="true">
          <Bot size={12} />
        </div>
      )}
      <div
        className={styles.miniContent}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(format(msg.content)) }}
      />
      {isAI && msg.sources && msg.sources.length > 0 && (
        <div className={styles.miniSources}>
          {msg.sources.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.miniSourceTag}>
              {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Floating chat button that appears on every page except /chat.
 * Includes a mini conversational panel with quick-chip shortcuts and
 * a link to the full-screen chat experience.
 */
const FloatingChat: React.FC = () => {
  const { pathname } = useLocation();
  const { isLoading, setLoading } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [miniMessages, setMiniMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll mini panel
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [miniMessages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Hide on /chat page
  if (pathname === '/chat') return null;

  const handleSend = async (text?: string) => {
    const rawInput = (text ?? inputValue).trim();
    if (!rawInput || isLoading) return;
    const sanitized = DOMPurify.sanitize(rawInput, { ALLOWED_TAGS: [] });
    if (!sanitized) return;
    setInputValue('');

    const userMsg: ChatMessage = {
      id: `mini_${Date.now()}`,
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
    };
    setMiniMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: sanitized }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json() as { content: string; sources?: Source[] };
      const aiMsg: ChatMessage = {
        id: `mini_${Date.now() + 1}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        sources: data.sources ?? [],
      };
      setMiniMessages((prev) => [...prev, aiMsg]);
    } catch {
      await new Promise<void>((r) => setTimeout(r, 800));
      const { content, sources } = getMockResponse(sanitized);
      const aiMsg: ChatMessage = {
        id: `mini_${Date.now() + 1}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
        sources,
      };
      setMiniMessages((prev) => [...prev, aiMsg]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  };

  const unreadCount = miniMessages.filter((m) => m.role === 'assistant').length;

  return (
    <div className={styles.container}>
      {/* ── Mini Chat Panel ─────────────────────────────────── */}
      {isOpen && (
        <div
          className={styles.popup}
          role="dialog"
          aria-modal="true"
          aria-label="ElectEd mini chat assistant"
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerDot} aria-hidden="true" />
              <h3>ElectEd AI</h3>
            </div>
            <div className={styles.headerActions}>
              <Link
                to="/chat"
                className={styles.fullChatBtn}
                title="Open full chat"
                aria-label="Open full chat page"
                onClick={() => setIsOpen(false)}
              >
                <ExternalLink size={14} />
                <span>Full chat</span>
              </Link>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className={styles.miniMessages}
            role="log"
            aria-live="polite"
            aria-label="Mini chat messages"
          >
            {miniMessages.length === 0 ? (
              <div className={styles.miniWelcome}>
                <Bot size={28} aria-hidden="true" />
                <p>Ask me anything about the US election process!</p>
                <div className={styles.chips}>
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip.q}
                      className={styles.chip}
                      onClick={() => void handleSend(chip.q)}
                      disabled={isLoading}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              miniMessages.map((msg) => <MiniMessage key={msg.id} msg={msg} />)
            )}

            {isLoading && (
              <div className={`${styles.miniMsg} ${styles.miniMsgAI}`} aria-label="AI thinking">
                <div className={styles.miniAvatar} aria-hidden="true">
                  <Bot size={12} />
                </div>
                <div className={styles.miniTyping}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.dot} aria-hidden="true" />
                  <span className="sr-only">ElectEd is thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* Input */}
          <form
            className={styles.miniInputArea}
            onSubmit={(e) => { e.preventDefault(); void handleSend(); }}
            aria-label="Send message to ElectEd AI"
          >
            <label htmlFor="floating-chat-input" className="sr-only">
              Ask about voting and elections
            </label>
            <input
              id="floating-chat-input"
              ref={inputRef}
              type="text"
              className={styles.miniInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about elections…"
              maxLength={300}
              disabled={isLoading}
              aria-label="Type your question"
            />
            <button
              type="submit"
              className={styles.miniSendBtn}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={14} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────── */}
      <button
        className={styles.fab}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={isOpen}
        aria-controls="floating-chat-panel"
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
        {!isOpen && miniMessages.length > 0 && (
          <span className={styles.badge} aria-label={`${unreadCount} messages`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingChat;
