import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getModel } from '@/lib/gemini';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional:
    'Use a formal, polished tone. Confident but not boastful. Structured and clear.',
  enthusiastic:
    'Use a warm, energetic tone. Show genuine excitement about the role and company. Still professional but more personal.',
  concise:
    'Be extremely concise. 3 short paragraphs max. Every sentence must earn its place. No filler words.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resume,
      jobDescription,
      companyName,
      hiringManager,
      tone = 'professional',
    } = body;

    // ── Basic validation ──
    if (!resume) {
      return Response.json(
        { error: 'Resume data is required. Please generate your resume first.' },
        { status: 400 }
      );
    }

    const company = companyName?.trim() || 'the company';
    const manager = hiringManager?.trim() || 'Hiring Manager';
    const toneGuide = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.professional;
    const hasJobDesc = jobDescription?.trim().length > 0;

    const model = getModel({ temperature: 0.8, maxOutputTokens: 600 });
    
    const prompt = `You are an expert career coach and professional cover letter writer.

## Task
Write a tailored cover letter for the candidate below applying to ${company}.

## Tone
${toneGuide}

## Formatting rules
- Address it to: ${manager}
- Do NOT include a date, address block, or "Sincerely," signature — just the body paragraphs
- Do NOT use placeholder text like [Your Name] or [Address]
- Do NOT add any preamble or explanation — output ONLY the cover letter text
- 3–4 paragraphs, each 2–4 sentences
- Start with a strong opening hook, not "I am writing to apply for…"
- Paragraph 2: highlight 1–2 specific, quantified achievements from their experience
- Paragraph 3: connect their skills to the role / company specifically
- Final paragraph: confident call to action

## Candidate resume
Name: ${resume.name}
Title: ${resume.jobTitle}
Summary: ${resume.summary || 'N/A'}

Experience:
${
  Array.isArray(resume.experience)
    ? resume.experience
        .map(
          (e: { role: string; company: string; dates: string; bullets?: string[] }) =>
            `- ${e.role} at ${e.company} (${e.dates})\n${
              e.bullets?.map((b: string) => `  • ${b}`).join('\n') ?? ''
            }`
        )
        .join('\n')
    : 'N/A'
}

Skills: ${Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills || 'N/A'}

Education:
${
  Array.isArray(resume.education)
    ? resume.education
        .map(
          (e: { degree: string; institution: string; dates: string }) =>
            `- ${e.degree} — ${e.institution} (${e.dates})`
        )
        .join('\n')
    : 'N/A'
}

## Job description
${hasJobDesc ? jobDescription.trim() : 'Not provided. Write a general but compelling letter for this type of role.'}

Now write the cover letter:`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    if (!coverLetter) {
      throw new Error('AI returned an empty response. Please try again.');
    }

    return Response.json({ coverLetter });
  } catch (error: unknown) {
    console.error('Cover letter generation error:', error);
    return Response.json(
      { error: getErrorMessage(error) || 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    );
  }
}