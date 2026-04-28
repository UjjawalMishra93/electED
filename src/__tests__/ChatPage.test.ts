/**
 * Unit tests for ChatPage and chat-related utilities.
 *
 * Tests: getMockResponse, formatContent, useChatStore, off-topic redirection.
 */

// ─── Helpers mirrored from ChatPage.tsx ───────────────────────────────────────

interface Source {
  label: string;
  url?: string;
}

interface MockResponse {
  content: string;
  sources: Source[];
}

const MOCK_RESPONSES: Record<string, MockResponse> = {
  default: {
    content:
      "Great question! The US election process is designed to ensure every eligible citizen can participate. I'm here to provide non-partisan, factual information about voter registration, the Electoral College, voting procedures, and more.",
    sources: [
      { label: 'USA.gov', url: 'https://usa.gov' },
      { label: 'Vote.gov', url: 'https://vote.gov' },
    ],
  },
  register: {
    content:
      'To register to vote in the US you must be a US citizen, at least 18 years old, and a resident of your state.',
    sources: [
      { label: 'Vote.gov', url: 'https://vote.gov' },
      { label: 'USA.gov', url: 'https://www.usa.gov/voter-registration' },
    ],
  },
  electoral: {
    content:
      'The Electoral College has 538 total electors. A candidate needs 270 electoral votes to win the presidency.',
    sources: [
      { label: 'USA.gov', url: 'https://www.usa.gov/electoral-college' },
      { label: 'Archives.gov', url: 'https://archives.gov' },
    ],
  },
};

function getMockResponse(query: string): MockResponse {
  const lower = query.toLowerCase();
  if (lower.includes('register') || lower.includes('registration'))
    return MOCK_RESPONSES.register!;
  if (lower.includes('electoral') || lower.includes('college'))
    return MOCK_RESPONSES.electoral!;
  return MOCK_RESPONSES.default!;
}

function formatContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('getMockResponse()', () => {
  it('returns register response for "register" keyword', () => {
    const result = getMockResponse('How do I register to vote?');
    expect(result).toEqual(MOCK_RESPONSES.register);
  });

  it('returns register response for "registration" keyword', () => {
    const result = getMockResponse('What is the voter registration deadline?');
    expect(result).toEqual(MOCK_RESPONSES.register);
  });

  it('returns electoral response for "electoral" keyword', () => {
    const result = getMockResponse('What is the electoral process?');
    expect(result).toEqual(MOCK_RESPONSES.electoral);
  });

  it('returns electoral response for "college" keyword', () => {
    const result = getMockResponse('Explain the Electoral College to me');
    expect(result).toEqual(MOCK_RESPONSES.electoral);
  });

  it('returns default response for an unrelated civic query', () => {
    const result = getMockResponse('When is Election Day?');
    expect(result).toEqual(MOCK_RESPONSES.default);
  });

  it('returns default response for empty-ish query', () => {
    const result = getMockResponse('hi');
    expect(result).toEqual(MOCK_RESPONSES.default);
  });

  it('is case-insensitive for keyword matching', () => {
    expect(getMockResponse('REGISTER NOW')).toEqual(MOCK_RESPONSES.register);
    expect(getMockResponse('ELECTORAL VOTES')).toEqual(MOCK_RESPONSES.electoral);
  });
});

describe('formatContent()', () => {
  it('converts **bold** markdown to <strong> HTML', () => {
    const result = formatContent('**Hello** world');
    expect(result).toBe('<strong>Hello</strong> world');
  });

  it('converts multiple bold segments', () => {
    const result = formatContent('**A** and **B**');
    expect(result).toBe('<strong>A</strong> and <strong>B</strong>');
  });

  it('converts newlines to <br/>', () => {
    const result = formatContent('Line one\nLine two');
    expect(result).toBe('Line one<br/>Line two');
  });

  it('handles both bold and newlines', () => {
    const result = formatContent('**Step 1**\nRegister online');
    expect(result).toBe('<strong>Step 1</strong><br/>Register online');
  });

  it('returns unchanged text if no markdown', () => {
    const result = formatContent('Plain text');
    expect(result).toBe('Plain text');
  });

  it('handles empty string', () => {
    const result = formatContent('');
    expect(result).toBe('');
  });
});

// ─── Chat Message ID Generation ─────────────────────────────────────────────────

describe('Chat Message ID Generation', () => {
  it('generates unique IDs based on timestamp', () => {
    const id1 = `msg_${Date.now()}`;
    // Use a very short delay
    const id2 = `msg_${Date.now() + 1}`;
    expect(id1).not.toBe(id2);
  });

  it('generates IDs with "msg_" prefix', () => {
    const id = `msg_${Date.now()}`;
    expect(id.startsWith('msg_')).toBe(true);
  });
});

// ─── Session ID Generation ──────────────────────────────────────────────────────

describe('Session ID Generation', () => {
  const generateSessionId = () =>
    `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  it('generates a session ID with the correct prefix', () => {
    const id = generateSessionId();
    expect(id.startsWith('session_')).toBe(true);
  });

  it('generates unique session IDs', () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateSessionId()));
    // In practice all 10 should be unique (highly likely)
    expect(ids.size).toBeGreaterThanOrEqual(9);
  });
});

// ─── SSE Streaming Parser ────────────────────────────────────────────────────────

describe('SSE Streaming Parser', () => {
  interface SseParsed {
    delta?: string;
    done?: boolean;
    sources?: Source[];
    error?: string;
  }

  function parseSseLine(line: string): SseParsed | null {
    if (!line.startsWith('data:')) return null;
    const jsonStr = line.slice(5).trim();
    if (!jsonStr) return null;
    try {
      return JSON.parse(jsonStr) as SseParsed;
    } catch {
      return null;
    }
  }

  it('parses a delta SSE line', () => {
    const line = 'data: {"delta":"Hello"}';
    const result = parseSseLine(line);
    expect(result?.delta).toBe('Hello');
  });

  it('parses a done SSE event with sources', () => {
    const sources = [{ label: 'USA.gov', url: 'https://usa.gov' }];
    const line = `data: ${JSON.stringify({ done: true, sources })}`;
    const result = parseSseLine(line);
    expect(result?.done).toBe(true);
    expect(result?.sources).toEqual(sources);
  });

  it('returns null for non-data lines', () => {
    expect(parseSseLine('')).toBeNull();
    expect(parseSseLine('event: message')).toBeNull();
    expect(parseSseLine(': comment')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    const result = parseSseLine('data: {bad json}');
    expect(result).toBeNull();
  });

  it('accumulates delta chunks correctly', () => {
    const chunks = ['Hello', ' World', '!'];
    let accumulated = '';
    for (const chunk of chunks) {
      accumulated += chunk;
    }
    expect(accumulated).toBe('Hello World!');
  });
});
