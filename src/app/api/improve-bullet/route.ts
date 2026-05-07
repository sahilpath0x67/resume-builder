// src/app/api/improve-bullet/route.ts
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getModel } from '@/lib/gemini';
const getErrorMessage = (e: unknown) => e instanceof Error ? e.message : 'Unknown error';

export async function POST(request: NextRequest) {
  try {
    const { bullet, role, company } = await request.json();
    if (!bullet) return Response.json({ error: 'Bullet text is required.' }, { status: 400 });

    const model = getModel({ temperature: 0.6, maxOutputTokens: 100 });

    const prompt = `You are an expert resume writer. Rewrite this resume bullet point to be stronger.

Role: ${role || 'Professional'}
Company: ${company || 'Company'}
Original bullet: "${bullet}"

Rules:
- Start with a strong action verb (Led, Built, Increased, Delivered, etc.)
- Add quantification if possible (%, $, numbers, team size)
- Keep it to ONE line, max 120 characters
- Make it more impactful and specific
- Output ONLY the rewritten bullet, nothing else, no quotes`;

    const result = await model.generateContent(prompt);
    const improved = result.response.text().trim().replace(/^["']|["']$/g, '');

    return Response.json({ improved });
  } catch (e: unknown) {
    console.error('Improve bullet error:', e);
    return Response.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}