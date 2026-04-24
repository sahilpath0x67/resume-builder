import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { bullet, role, company } = await req.json();

    const prompt = `You are a professional resume writer. Rewrite this resume bullet point to be stronger, more quantified, and ATS-friendly.

Original bullet: "${bullet}"
Role: ${role || 'not specified'}
Company: ${company || 'not specified'}

Rules:
- Start with a strong action verb
- Add specific metrics/numbers if possible (estimate if needed, use phrases like "~20%" or "3x")
- Keep it under 20 words
- Make it impactful

Respond with ONLY the improved bullet text. No quotes, no explanation, no JSON.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const improved = message.content.map(b => (b.type === 'text' ? b.text : '')).join('').trim();
    return NextResponse.json({ improved });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to improve bullet.' }, { status: 500 });
  }
}
