import { GoogleGenerativeAI } from '@google/generative-ai';

// `gemini-pro` was retired by Google in 2025; default to a current model and
// allow overriding without a code change.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
