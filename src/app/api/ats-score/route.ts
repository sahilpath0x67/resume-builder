import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume) {
      return Response.json({ error: 'Resume data is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `You are an expert ATS (Applicant Tracking System) specialist.

Analyze the resume against the job description and return ONLY valid JSON with no extra text, markdown, or code fences.

Resume:
${JSON.stringify(resume, null, 2)}

Job Description:
${jobDescription || 'Not provided — do a general ATS analysis.'}

Return this exact JSON structure:

{
  "overallScore": <number 0-100>,
  "breakdown": {
    "keywords":         { "score": <0-100>, "feedback": "<one sentence>" },
    "formatting":       { "score": <0-100>, "feedback": "<one sentence>" },
    "quantification":   { "score": <0-100>, "feedback": "<one sentence>" },
    "summaryStrength":  { "score": <0-100>, "feedback": "<one sentence>" },
    "skillsMatch":      { "score": <0-100>, "feedback": "<one sentence>" }
  },
  "missingKeywords": ["keyword1", "keyword2"],
  "topSuggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

Rules:
- overallScore is the weighted average of the breakdown scores
- missingKeywords: important keywords from the job description missing from the resume (empty array if no job description)
- topSuggestions: 3-5 specific, actionable recommendations starting with action verbs
- Return ONLY the JSON object, nothing else`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    // Validate required fields exist before returning
    if (!parsed.overallScore || !parsed.breakdown) {
      throw new Error('Invalid response structure from AI.');
    }

    return Response.json(parsed);

  } catch (error: unknown) {
    console.error('ATS Score error:', error);
    return Response.json(
      { error: getErrorMessage(error) || 'Failed to analyze ATS score. Please try again.' },
      { status: 500 }
    );
  }
}