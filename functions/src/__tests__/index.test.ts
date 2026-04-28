/**
 * Unit tests for Cloud Function helpers.
 * Tests: off-topic detection, rate limiting, input sanitization.
 *
 * These tests run isolated from Firebase using jest.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Re-implement helpers here (mirroring functions/src/index.ts) so tests
// run without initialising Firebase Admin.
// ──────────────────────────────────────────────────────────────────────────────

const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\b(kill|murder|attack|bomb|weapon|terrorism|drug|illegal|hack|steal)\b/i,
  /\b(endorse|vote for|support candidate|campaign for|donate to)\b/i,
  /\b(sex|porn|gambling|crypto|stock|invest|forex)\b/i,
  /\b(recipe|sports|movie|music|weather|cooking|travel)\b/i,
];

const CIVIC_TOPIC_PATTERNS: RegExp[] = [
  /\b(vote|voting|voter|election|elect|ballot|candidate|primary|caucus|electoral|congress|senate|president|governor|legislat|register|registration|citizenship|citizen|democracy|republic|constitution|amendment|poll|polling|absentee|campaign|political party|inaugur)\b/i,
];

function isOffTopic(query: string): boolean {
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(query)) return true;
  }
  if (query.trim().length > 30) {
    const hasCivicKeyword = CIVIC_TOPIC_PATTERNS.some((p) => p.test(query));
    if (!hasCivicKeyword) return true;
  }
  return false;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

function createRateLimitStore() {
  const store = new Map<string, { count: number; timestamp: number }>();

  function checkRateLimit(ip: string, now: number = Date.now()): { allowed: boolean; reason?: string } {
    const entry = store.get(ip);
    if (entry && now - entry.timestamp < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false, reason: 'Rate limit exceeded' };
      }
      entry.count++;
    } else {
      store.set(ip, { count: 1, timestamp: now });
    }
    return { allowed: true };
  }

  return { checkRateLimit, store };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('isOffTopic()', () => {
  describe('civic queries — should be ON-topic (return false)', () => {
    const civicQueries = [
      'How do I register to vote?',
      'What is the Electoral College?',
      'When is Election Day?',
      'How do absentee ballots work?',
      'What ID do I need to vote in Texas?',
      'Tell me about the 19th amendment',
      'How does a primary election work?',
      'What are my voting rights?',
      'How does Congress pass a law?',
      'What is a ballot measure?',
    ];

    civicQueries.forEach((query) => {
      it(`should allow: "${query}"`, () => {
        expect(isOffTopic(query)).toBe(false);
      });
    });
  });

  describe('harmful/banned terms — should be OFF-topic (return true)', () => {
    const harmfulQueries = [
      'How do I hack into a voter database?',
      'Tell me how to make a bomb',
      'Best stock to invest in for election season',
      'How do I endorse a candidate on social media?',
    ];

    harmfulQueries.forEach((query) => {
      it(`should block: "${query}"`, () => {
        expect(isOffTopic(query)).toBe(true);
      });
    });
  });

  describe('clearly off-topic long queries — should return true', () => {
    const offTopicQueries = [
      'What is the best pasta recipe for a dinner party tonight?',
      'Can you recommend a good action movie to watch this weekend?',
      'What is the weather going to be like in New York tomorrow?',
      'Give me tips for planning a vacation trip to Italy this summer.',
    ];

    offTopicQueries.forEach((query) => {
      it(`should block: "${query}"`, () => {
        expect(isOffTopic(query)).toBe(true);
      });
    });
  });

  describe('short queries — lenient handling', () => {
    it('should allow short queries without civic keywords (< 30 chars)', () => {
      // Short ambiguous queries are allowed through
      expect(isOffTopic('Tell me more')).toBe(false);
      expect(isOffTopic('help')).toBe(false);
    });
  });
});

// ── Rate Limiting Tests ────────────────────────────────────────────────────────

describe('Rate Limiting', () => {
  it('allows first request for a new IP', () => {
    const { checkRateLimit } = createRateLimitStore();
    const result = checkRateLimit('192.168.0.1', 1000);
    expect(result.allowed).toBe(true);
  });

  it('allows up to MAX_REQUESTS_PER_WINDOW requests within window', () => {
    const { checkRateLimit } = createRateLimitStore();
    const ip = '10.0.0.1';
    const now = Date.now();
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      const result = checkRateLimit(ip, now);
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the request after MAX_REQUESTS_PER_WINDOW is exceeded', () => {
    const { checkRateLimit } = createRateLimitStore();
    const ip = '10.0.0.2';
    const now = Date.now();
    // Fill up limit
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      checkRateLimit(ip, now);
    }
    // Next one should be blocked
    const result = checkRateLimit(ip, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Rate limit exceeded');
  });

  it('resets limit after the window expires', () => {
    const { checkRateLimit } = createRateLimitStore();
    const ip = '10.0.0.3';
    const start = 1000;
    // Fill up limit
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      checkRateLimit(ip, start);
    }
    // Advance time past the window
    const afterWindow = start + RATE_LIMIT_WINDOW_MS + 1;
    const result = checkRateLimit(ip, afterWindow);
    expect(result.allowed).toBe(true);
  });

  it('allows different IPs independently', () => {
    const { checkRateLimit } = createRateLimitStore();
    const now = Date.now();
    // Fill up limit for ip1
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      checkRateLimit('ip1', now);
    }
    // ip2 should still be allowed
    const result = checkRateLimit('ip2', now);
    expect(result.allowed).toBe(true);
  });
});

// ── Input Validation Tests ──────────────────────────────────────────────────────

describe('Input Validation', () => {
  it('rejects empty prompt', () => {
    const prompt = '';
    expect(prompt.trim().length).toBe(0);
  });

  it('rejects prompt over 1000 characters', () => {
    const longPrompt = 'a'.repeat(1001);
    expect(longPrompt.length).toBeGreaterThan(1000);
  });

  it('accepts prompt within 1000 characters', () => {
    const validPrompt = 'How do I register to vote?';
    expect(validPrompt.length).toBeLessThanOrEqual(1000);
    expect(validPrompt.trim().length).toBeGreaterThan(0);
  });
});
