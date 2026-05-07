// src/app/api/tailor-resume/route.ts
import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { getModel } from '@/lib/gemini';
const getErrorMessage = (e: unknown) => e instanceof Error ? e.message : 'Unknown error';

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();
    if (!resume || !jobDescription) return Response.json({ error: 'Resume and job description are required.' }, { status: 400 });

    const model = getModel({ temperature: 0.7, maxOutputTokens: 1500 });

    const prompt = `You are an expert resume writer specializing in ATS optimization.

Tailor this resume to match the job description. Return ONLY valid JSON, no markdown, no extra text.

Job Description:
${jobDescription}

Current Resume:
${JSON.stringify(resume, null, 2)}

Instructions:
- Rewrite the summary to directly address the job requirements
- Reorder and strengthen experience bullets to highlight relevant skills
- Keep all factual information accurate — do not invent experience
- Add missing keywords from the job description naturally
- Keep the same JSON structure as the input resume

Return the same JSON structure as the input resume with tailored content.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const tailored = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return Response.json({ resume: tailored });
  } catch (e: unknown) {
    console.error('Tailor resume error:', e);
    return Response.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}