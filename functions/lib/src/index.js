"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
admin.initializeApp();
const corsHandler = (0, cors_1.default)({ origin: true });
// Setup DOMPurify on the server
const window = new jsdom_1.JSDOM('').window;
const purify = (0, dompurify_1.default)(window);
// Rate limiter mock store (in a real app, use Redis or Firestore)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute
/**
 * Chat API endpoint using Gemini 1.5 Pro.
 */
exports.chat = (0, https_1.onRequest)({
    cors: true,
    maxInstances: 10,
    memory: '512MiB',
    secrets: ['GEMINI_API_KEY']
}, (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }
        try {
            // 1. Rate Limiting (based on IP)
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const ipStr = Array.isArray(ip) ? ip[0] : ip;
            const now = Date.now();
            const userLimit = rateLimitStore.get(ipStr);
            if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW_MS) {
                if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
                    throw new https_1.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.');
                }
                userLimit.count++;
            }
            else {
                rateLimitStore.set(ipStr, { count: 1, timestamp: now });
            }
            // 2. Input Sanitization
            const rawPrompt = req.body.prompt;
            if (!rawPrompt || typeof rawPrompt !== 'string') {
                throw new https_1.HttpsError('invalid-argument', 'The "prompt" field must be a string.');
            }
            const cleanPrompt = purify.sanitize(rawPrompt, { ALLOWED_TAGS: [] });
            if (!cleanPrompt.trim()) {
                throw new https_1.HttpsError('invalid-argument', 'The prompt cannot be empty after sanitization.');
            }
            // 3. System Prompt & RAG Simulation
            // In Phase 1 we mock the RAG retrieval from Firestore.
            const systemInstruction = `
You are ElectEd, a non-partisan, factual AI assistant designed to educate US citizens about the election process.
Rules:
1. Provide neutral, unbiased, and factual information based only on official US government processes and laws.
2. DO NOT express political opinions, endorse candidates, or predict election outcomes.
3. If asked about a topic outside the scope of US civics, elections, and government, politely decline to answer.
4. Keep responses clear, concise, and easy to understand (Plain writing).
5. Always ground your responses in verified concepts like the US Constitution, state laws, and official procedures.
      `;
            // 4. Gemini API Call
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new https_1.HttpsError('internal', 'AI service configuration error.');
            }
            const ai = new genai_1.GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-pro',
                contents: [
                    { role: 'user', parts: [{ text: cleanPrompt }] }
                ],
                config: {
                    systemInstruction,
                    temperature: 0.2, // Low temperature for factual consistency
                }
            });
            // 5. Response Formatting
            const text = response.text || 'I apologize, but I could not generate a response. Please try again.';
            // Send standard response with mocked sources for now (Phase 1 plan)
            res.status(200).json({
                content: text,
                sources: [
                    { label: 'USA.gov', url: 'https://usa.gov' },
                    { label: 'Vote.gov', url: 'https://vote.gov' }
                ]
            });
        }
        catch (error) {
            console.error('Chat function error:', error);
            if (error instanceof https_1.HttpsError) {
                res.status(error.httpErrorCode.status).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'An internal error occurred.' });
            }
        }
    });
});
//# sourceMappingURL=index.js.map