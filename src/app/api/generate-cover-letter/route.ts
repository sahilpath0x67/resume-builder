import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resume, jobDescription, companyName, hiringManager } = await req.json();

    const prompt = `You are an expert cover letter writer. Write a compelling, personalized cover letter based on the resume and job description below.

Resume:
${JSON.stringify(resume, null, 2)}

Job Description / Role:
${jobDescription || 'Not provided — write a general cover letter for the role.'}

Company: ${companyName || 'the company'}
Hiring Manager: ${hiringManager || 'Hiring Manager'}

Instructions:
- 3 paragraphs: hook/intro, why you're the fit (reference specific experience), closing with CTA
- Confident but not arrogant tone
- Reference specific achievements from the resume
- Keep it under 300 words
- Do NOT start with "I am writing to..."

Return ONLY the cover letter text, no subject line, no JSON, no markdown.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    return NextResponse.json({ coverLetter: text });
  } catch (err) {
    console.error('Cover letter error:', err);
    return NextResponse.json({ error: 'Failed to generate cover letter.' }, { status: 500 });
  }
}
