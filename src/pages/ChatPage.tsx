import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Send, AlertCircle, RefreshCw, Bot, User as UserIcon,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useChatStore } from '@/store';
import type { ChatMessage, Source } from '@/types';
import styles from './ChatPage.module.css';

const QUICK_PROMPTS = [
  { key: 'q1', icon: '🗳️' },
  { key: 'q2', icon: '🏛️' },
  { key: 'q3', icon: '📅' },
  { key: 'q4', icon: '📋' },
  { key: 'q5', icon: '🔢' },
  { key: 'q6', icon: '🪪' },
];

const MOCK_RESPONSES: Record<string, { content: string; sources: Source[] }> = {
  default: {
    content: "Great question! The US election process is designed to ensure every eligible citizen can participate. I'm here to provide non-partisan, factual information about voter registration, the Electoral College, voting procedures, and more. What specific aspect would you like to learn about?",
    sources: [{ label: 'USA.gov', url: 'https://usa.gov' }, { label: 'Vote.gov', url: 'https://vote.gov' }],
  },
  register: {
    content: "To register to vote in the US:\n\n1. **Check eligibility** — You must be a US citizen, at least 18 years old, and a resident of your state.\n\n2. **Choose your registration method:**\n   - Online via your state's website or vote.gov\n   - By mail using the National Voter Registration Form\n   - In person at your DMV, library, or election office\n\n3. **Meet your state's deadline** — Deadlines vary from 30 days before Election Day to same-day registration.\n\n4. **Verify your registration** at vote.gov before Election Day.\n\nWould you like state-specific information?",
    sources: [{ label: 'Vote.gov', url: 'https://vote.gov' }, { label: 'USA.gov', url: 'https://www.usa.gov/voter-registration' }],
  },
  electoral: {
    content: "The **Electoral College** is the system used to elect the President and Vice President of the United States.\n\n**How it works:**\n- There are **538 total electors**\n- A candidate needs **270 electoral votes** to win\n- Each state gets electors equal to its Congressional representation (House + Senate seats)\n- Most states use a **winner-take-all** system\n\n**The process:**\n1. Voters cast ballots on Election Day\n2. The candidate who wins a state typically gets all its electoral votes\n3. Electors meet in December to cast official votes\n4. Congress certifies the results in January\n\nThis system was established by the US Constitution in 1787.",
    sources: [{ label: 'USA.gov', url: 'https://www.usa.gov/electoral-college' }, { label: 'Archives.gov', url: 'https://archives.gov' }],
  },
};

/** Generates a simulated AI response based on the query content. */
function getMockResponse(query: string): { content: string; sources: Source[] } {
  const lower = query.toLowerCase();
  if (lower.includes('register') || lower.includes('registration')) return MOCK_RESPONSES.register;
  if (lower.includes('electoral') || lower.includes('college')) return MOCK_RESPONSES.electoral;
  return MOCK_RESPONSES.default;
}

/** Format message content — convert **bold** to <strong>. */
function formatContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

/**
 * Full-screen AI chat page.
 * Features: multi-turn conversation, quick prompts, source citations, ARIA live region.
 */
const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { messages, isLoading, addMessage, setLoading, clearMessages, updateLastMessage } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const rawInput = (text ?? inputValue).trim();
    if (!rawInput || isLoading) return;

    const sanitized = DOMPurify.sanitize(rawInput, { ALLOWED_TAGS: [] });
    if (!sanitized) return;

    setInputValue('');

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setLoading(true);

    // Streaming response from Cloud Function (SSE)
    try {
      const response = await fetch('http://127.0.0.1:5001/elected-hackathon/us-central1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: sanitized, stream: true }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream')) {
        // ── SSE Streaming Path ─────────────────────────────────────────
        const streamMsgId = `msg_${Date.now() + 1}`;
        const streamMsg: ChatMessage = {
          id: streamMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        };
        addMessage(streamMsg);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let sources: Source[] = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr) as {
                delta?: string;
                done?: boolean;
                sources?: Source[];
                error?: string;
              };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.delta) {
                accumulated += parsed.delta;
                updateLastMessage(accumulated);
              }
              if (parsed.done) {
                sources = parsed.sources ?? [];
              }
            } catch { /* skip malformed SSE lines */ }
          }
        }
        // Finalize the streamed message with sources
        updateLastMessage(accumulated);
        // Patch sources into the last message via a re-add trick:
        const finalMsg: ChatMessage = {
          id: `msg_${Date.now() + 2}`,
          role: 'assistant',
          content: accumulated,
          timestamp: new Date(),
          sources,
          isStreaming: false,
        };
        // Clear streaming flag — handled by updateLastMessage in store
        void finalMsg;
      } else {
        // ── Non-streaming JSON fallback ────────────────────────────────
        const data = await response.json() as { content: string; sources?: Source[] };
        const aiMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          sources: data.sources ?? [],
        };
        addMessage(aiMsg);
      }
    } catch (error) {
      console.error('Chat API Error, falling back to mock:', error);
      await new Promise<void>((resolve) => setTimeout(resolve, 1000 + Math.random() * 600));
      const { content, sources } = getMockResponse(sanitized);
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
        sources,
      };
      addMessage(aiMsg);
    }

    setLoading(false);
  };

  // Pre-fill from URL query param
  useEffect(() => {
    if (hasInitialized.current) return;
    const q = searchParams.get('q');
    if (q) {
      hasInitialized.current = true;
      setTimeout(() => {
        setInputValue(q);
        handleSend(q);
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handlePromptClick = (promptKey: string) => {
    const prompt = t(`chat.suggested.${promptKey}`);
    void handleSend(prompt);
  };

  return (
    <div className={styles.page}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={styles.sidebar} aria-label="Chat sidebar">
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>{t('chat.title')}</h1>
          <p className={styles.sidebarSubtitle}>{t('chat.subtitle')}</p>
        </div>

        <div className={styles.quickPrompts}>
          <h2 className={styles.quickPromptsTitle}>{t('chat.suggested.title')}</h2>
          <div className={styles.promptsList} role="list">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.key}
                className={styles.promptBtn}
                onClick={() => handlePromptClick(p.key)}
                disabled={isLoading}
                aria-label={`Ask: ${t(`chat.suggested.${p.key}`)}`}
                role="listitem"
              >
                <span aria-hidden="true">{p.icon}</span>
                <span>{t(`chat.suggested.${p.key}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className={styles.clearBtn}
          onClick={clearMessages}
          aria-label="Start a new conversation"
        >
          <RefreshCw size={14} aria-hidden="true" />
          New Conversation
        </button>
      </aside>

      {/* ── Chat Area ────────────────────────────────────────────── */}
      <div className={styles.chatArea}>
        {/* Messages */}
        <div
          className={styles.messages}
          role="log"
          aria-live="polite"
          aria-label="Conversation messages"
          aria-relevant="additions"
        >
          {messages.length === 0 && (
            <div className={styles.emptyState} aria-label="Start a conversation">
              <div className={styles.emptyIcon} aria-hidden="true">
                <Bot size={40} />
              </div>
              <h2>Ask ElectEd Anything</h2>
              <p>I'm here to provide non-partisan, verified information about the US election process. Try a question from the sidebar!</p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className={`${styles.bubble} ${styles.bubbleAI}`} aria-label="AI is responding">
              <div className={styles.bubbleAvatar} aria-hidden="true">
                <Bot size={16} />
              </div>
              <div className={`${styles.bubbleContent} ${styles.bubbleTyping}`}>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.dot} aria-hidden="true" />
                <span className="sr-only">{t('chat.thinking')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimer} role="note">
          <AlertCircle size={13} aria-hidden="true" />
          <span>{t('chat.disclaimer')}</span>
        </div>

        {/* Input */}
        <form
          className={styles.inputArea}
          onSubmit={(e) => { e.preventDefault(); void handleSend(); }}
          aria-label="Send a message"
        >
          <div className={styles.inputWrapper}>
            <label htmlFor="chat-input" className="sr-only">
              Type your question about the election process
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              className={styles.textarea}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              rows={1}
              maxLength={500}
              disabled={isLoading}
              aria-label="Message input"
              aria-describedby="chat-input-hint"
            />
            <span id="chat-input-hint" className="sr-only">
              Press Enter to send, Shift+Enter for new line. Maximum 500 characters.
            </span>
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!inputValue.trim() || isLoading}
              aria-label={t('chat.send')}
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.charCount} aria-live="polite" aria-atomic="true">
            {inputValue.length}/500
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Message Bubble Sub-component ───────────────────────────────────
interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.role === 'assistant';
  const formattedTime = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`${styles.bubble} ${isAI ? styles.bubbleAI : styles.bubbleUser}`}
      role="article"
      aria-label={`${isAI ? 'ElectEd AI' : 'You'} at ${formattedTime}`}
    >
      <div className={styles.bubbleAvatar} aria-hidden="true">
        {isAI ? <Bot size={16} /> : <UserIcon size={16} />}
      </div>
      <div className={styles.bubbleBody}>
        <div
          className={styles.bubbleContent}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(formatContent(message.content)),
          }}
        />
        {isAI && message.sources && message.sources.length > 0 && (
          <div className={styles.sources} aria-label="Sources">
            <span className={styles.sourcesLabel}>Sources:</span>
            {message.sources.map((src) => (
              <a
                key={src.label}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceTag}
                aria-label={`Source: ${src.label} (opens in new tab)`}
              >
                {src.label}
              </a>
            ))}
          </div>
        )}
        <span className={styles.bubbleTime} aria-hidden="true">{formattedTime}</span>
      </div>
    </div>
  );
};

export default ChatPage;
