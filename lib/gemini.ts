import { GoogleGenerativeAI } from '@google/generative-ai';

// Models to try in order. `gemini-pro` and `gemini-2.5-flash` were retired for new
// API keys; these are current and work with free AI Studio keys.
// Override with GEMINI_MODEL in .env.local / Vercel.
export const GEMINI_MODELS: string[] = [
  ...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []),
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

export const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
