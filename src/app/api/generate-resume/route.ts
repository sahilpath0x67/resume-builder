import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const prompt = `You are an expert professional resume writer with 15 years of experience helping candidates land jobs at top companies. Given the following user data, generate a polished, ATS-optimized resume.

Instructions:
- Write a compelling 2-3 sentence professional summary (even if one is provided, improve it)
- Transform experience descriptions into strong, quantified bullet points starting with power verbs
- Keep bullets concise and impactful (1 line each)
- Organize skills into a clean list
- If information is sparse, make professional improvements while staying true to the user's background

User data:
${JSON.stringify(data, null, 2)}

Respond ONLY with valid JSON, no markdown fences, no explanation. Use EXACTLY this structure:
{
  "name": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "period": "string",
      "bullets": ["string", "string", "string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "period": "string"
    }
  ],
  "skills": ["string"],
  "achievements": ["string"]
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const resume = JSON.parse(clean);

    return NextResponse.json({ resume });
  } catch (err) {
    console.error('Resume generation error:', err);
    return NextResponse.json({ error: 'Failed to generate resume. Check your API key.' }, { status: 500 });
  }
}
