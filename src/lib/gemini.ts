// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const MODEL = 'gemini-2.0-flash';

export function getModel(config?: { temperature?: number; maxOutputTokens?: number }) {
  return genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: config?.temperature ?? 0.7,
      maxOutputTokens: config?.maxOutputTokens ?? 1000,
    },
  });
}