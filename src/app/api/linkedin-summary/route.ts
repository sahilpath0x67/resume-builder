import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();

    const prompt = `Based on this resume, write an engaging LinkedIn "About" section.

Resume: ${JSON.stringify(resume, null, 2)}

Rules:
- First person voice
- 3-4 short paragraphs
- Start with a hook (not "I am a...")
- Mention top skills and biggest achievement
- End with what you're looking for / open to
- Max 300 words, conversational but professional

Return ONLY the LinkedIn about text. No JSON, no markdown, no explanation.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content.map(b => (b.type === 'text' ? b.text : '')).join('').trim();
    return NextResponse.json({ linkedin: text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate LinkedIn summary.' }, { status: 500 });
  }
}
