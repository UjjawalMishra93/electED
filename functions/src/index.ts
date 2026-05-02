import { onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

admin.initializeApp();

const db = admin.firestore();
const corsHandler = cors({ origin: true });

// Setup DOMPurify on the server
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window & typeof globalThis);

// ─── Rate Limiter (in-memory; use Redis/Firestore for production) ─────────────
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW_MS) {
    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      throw new HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again in a minute.');
    }
    userLimit.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
  }
}

// ─── Off-topic / Harmful Detection ────────────────────────────────────────────
const OFF_TOPIC_PATTERNS = [
  /\b(kill|murder|attack|bomb|weapon|terrorism|drug|illegal|hack|steal)\b/i,
  /\b(endorse|vote for|support candidate|campaign for|donate to)\b/i,
  /\b(sex|porn|gambling|crypto|stock|invest|forex)\b/i,
  /\b(recipe|sports|movie|music|weather|cooking|travel)\b/i,
];

const CIVIC_TOPIC_PATTERNS = [
  /\b(vote|voting|voter|election|elect|ballot|candidate|primary|caucus|electoral|congress|senate|president|governor|legislat|register|registration|citizenship|citizen|democracy|republic|constitution|amendment|poll|polling|absentee|campaign|political party|inaugur)\b/i,
];

/**
 * Determines if a query is on-topic for a civic education assistant.
 * Returns true if the query should be rejected.
 */
function isOffTopic(query: string): boolean {
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(query)) return true;
  }
  // If query is long enough and has NO civic keywords, treat as off-topic
  if (query.trim().length > 30) {
    const hasCivicKeyword = CIVIC_TOPIC_PATTERNS.some((p) => p.test(query));
    if (!hasCivicKeyword) return true;
  }
  return false;
}

// ─── Firebase ID Token Auth Middleware ────────────────────────────────────────
async function verifyAuthToken(authHeader: string | undefined): Promise<admin.auth.DecodedIdToken | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

async function recordChatLog(
  userId: string,
  prompt: string,
  responseText: string,
  offTopic: boolean,
): Promise<void> {
  try {
    await db.collection('chat_logs').add({
      userId,
      prompt,
      response: responseText,
      offTopic,
      model: 'gemini-1.5-pro',
      createdAt: admin.firestore.Timestamp.now(),
    });
  } catch (err) {
    console.warn('Unable to persist chat log:', err);
  }
}

// ─── RAG: Retrieve election facts from Firestore ──────────────────────────────
async function retrieveRelevantFacts(query: string): Promise<string> {
  try {
    const queryLower = query.toLowerCase();
    const keywordsToTags: Record<string, string[]> = {
      register: ['registration', 'voter-registration'],
      electoral: ['electoral-college', 'electors'],
      primary: ['primaries', 'caucus'],
      id: ['voter-id', 'identification'],
      absentee: ['absentee', 'mail-in'],
      voting: ['voting-process', 'how-to-vote'],
    };

    const matchedTags: string[] = [];
    for (const [keyword, tags] of Object.entries(keywordsToTags)) {
      if (queryLower.includes(keyword)) {
        matchedTags.push(...tags);
      }
    }

    if (matchedTags.length === 0) {
      matchedTags.push('general');
    }

    // Query Firestore for matching election facts (limit 3 for context window)
    const snapshot = await db
      .collection('election_facts')
      .where('tags', 'array-contains-any', matchedTags.slice(0, 10))
      .limit(3)
      .get();

    if (snapshot.empty) return '';

    const facts = snapshot.docs.map((doc) => {
      const data = doc.data() as { topic: string; content: string; source: string };
      return `[${data.topic}]: ${data.content} (Source: ${data.source})`;
    });

    return facts.join('\n\n');
  } catch (err) {
    console.warn('RAG retrieval failed (non-fatal):', err);
    return '';
  }
}

// ─── Chat Cloud Function ──────────────────────────────────────────────────────
/**
 * POST /chat
 * Headers:
 *   Authorization: Bearer <Firebase ID Token>  (optional for anonymous users)
 *   Content-Type: application/json
 * Body: { prompt: string, stream?: boolean }
 *
 * Responses:
 *   200 application/json  { content, sources }
 *   200 text/event-stream  SSE events with { delta } chunks (if stream=true)
 */
export const chat = onRequest(
  {
    cors: true,
    maxInstances: 10,
    memory: '512MiB',
    secrets: ['GEMINI_API_KEY'],
  },
  (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      try {
        // 1. Rate Limiting
        const ip = (
          Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown'
        ) as string;
        checkRateLimit(ip);

        // 2. Firebase ID Token Auth (optional — anonymous allowed; token enriches session)
        const decodedToken = await verifyAuthToken(req.headers.authorization);
        const userId = decodedToken?.uid ?? 'anonymous';

        // 3. Input Validation & Sanitization
        const rawPrompt = req.body?.prompt;
        const wantStream = req.body?.stream === true;

        if (!rawPrompt || typeof rawPrompt !== 'string') {
          throw new HttpsError('invalid-argument', 'The "prompt" field must be a non-empty string.');
        }
        if (rawPrompt.length > 1000) {
          throw new HttpsError('invalid-argument', 'Prompt must be 1000 characters or less.');
        }

        const cleanPrompt = purify.sanitize(rawPrompt, { ALLOWED_TAGS: [] });
        if (!cleanPrompt.trim()) {
          throw new HttpsError('invalid-argument', 'Prompt is empty after sanitization.');
        }

        // 4. Off-topic / Harmful Query Detection
        if (isOffTopic(cleanPrompt)) {
          const reply =
            "I'm ElectEd, a civic education assistant focused on US elections and voting. " +
            "I can't help with that topic, but I'd love to answer questions about voter " +
            'registration, the Electoral College, voting processes, or civics in general!';

          await recordChatLog(userId, cleanPrompt, reply, true);

          res.status(200).json({
            content: reply,
            sources: [{ label: 'Vote.gov', url: 'https://vote.gov' }],
            offTopic: true,
          });
          return;
        }

        // 5. RAG — retrieve relevant Firestore election facts
        const ragContext = await retrieveRelevantFacts(cleanPrompt);

        // 6. Build System Prompt
        const systemInstruction = `
You are ElectEd, a non-partisan, factual AI assistant designed to educate US citizens about the election process.

Rules:
1. Provide neutral, unbiased, and factual information based only on official US government processes and laws.
2. DO NOT express political opinions, endorse candidates, or predict election outcomes.
3. If asked about topics outside US civics, elections, and government, politely decline.
4. Keep responses clear, concise, and easy to understand (plain language).
5. Always ground your responses in the US Constitution, state laws, and official procedures.
6. Use the knowledge base context below when relevant to the question.

Knowledge Base Context:
${ragContext || 'No specific context retrieved. Use your general civic education knowledge.'}
        `.trim();

        // 7. Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new HttpsError('internal', 'AI service configuration error.');
        }

        const ai = new GoogleGenAI({ apiKey });

        // 8a. Streaming Response (SSE)
        if (wantStream) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();

          try {
            const streamResponse = await ai.models.generateContentStream({
              model: 'gemini-1.5-pro',
              contents: [{ role: 'user', parts: [{ text: cleanPrompt }] }],
              config: { systemInstruction, temperature: 0.2 },
            });

            let streamText = '';
            for await (const chunk of streamResponse) {
              const delta = chunk.text ?? '';
              if (delta) {
                streamText += delta;
                res.write(`data: ${JSON.stringify({ delta })}\n\n`);
              }
            }

            await recordChatLog(userId, cleanPrompt, streamText.trim(), false);

            // End event with sources
            res.write(
              `data: ${JSON.stringify({
                done: true,
                sources: [
                  { label: 'USA.gov', url: 'https://usa.gov' },
                  { label: 'Vote.gov', url: 'https://vote.gov' },
                ],
                userId,
              })}\n\n`,
            );
          } catch {
            res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
          }
          res.end();
          return;
        }

        // 8b. Standard (Non-streaming) Response
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-pro',
          contents: [{ role: 'user', parts: [{ text: cleanPrompt }] }],
          config: { systemInstruction, temperature: 0.2 },
        });

        const text =
          response.text ??
          'I apologize, but I could not generate a response. Please try again.';

        await recordChatLog(userId, cleanPrompt, text, false);

        res.status(200).json({
          content: text,
          sources: [
            { label: 'USA.gov', url: 'https://usa.gov' },
            { label: 'Vote.gov', url: 'https://vote.gov' },
          ],
          userId,
        });
      } catch (error: unknown) {
        console.error('Chat function error:', error);
        if (error instanceof HttpsError) {
          res.status(error.httpErrorCode.status).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'An internal server error occurred.' });
        }
      }
    });
  },
);
