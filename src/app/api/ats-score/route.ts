import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription } = await req.json();

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume and give a detailed score.

Resume:
${JSON.stringify(resume, null, 2)}

Job Description (if provided):
${jobDescription || 'Not provided — do a general ATS analysis.'}

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "overallScore": 85,
  "breakdown": {
    "formatting": { "score": 90, "feedback": "one sentence" },
    "keywords": { "score": 75, "feedback": "one sentence" },
    "quantification": { "score": 80, "feedback": "one sentence" },
    "summaryStrength": { "score": 85, "feedback": "one sentence" },
    "skillsMatch": { "score": 70, "feedback": "one sentence" }
  },
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "topSuggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content.map(b => (b.type === 'text' ? b.text : '')).join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'ATS analysis failed.' }, { status: 500 });
  }
}
