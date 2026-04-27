import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return Response.json({ 
        error: "Both resume and job description are required" 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite" 
    });

    const prompt = `You are an expert ATS (Applicant Tracking System) optimization specialist.

Analyze the following resume against the job description and provide a detailed ATS compatibility analysis.

**Resume:**
${JSON.stringify(resume, null, 2)}

**Job Description:**
${jobDescription}

Return **ONLY** valid JSON with this exact structure (no extra text):

{
  "score": number,
  "scoreColor": "green" | "yellow" | "red",
  "strengths": string[],
  "weaknesses": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}

Rules:
- score should be between 0 and 100
- scoreColor: "green" if score >= 80, "yellow" if 60-79, "red" if <60
- strengths: 3-5 positive points
- weaknesses: 2-4 areas that need improvement
- missingKeywords: important keywords from the job description that are missing in the resume
- suggestions: specific, actionable bullet-point style recommendations (start with action verbs)

Be honest, constructive, and professional.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Safe JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const atsData = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return Response.json(atsData);

  } catch (error: any) {
    console.error("ATS Score error:", error);
    return Response.json({ 
      error: error.message || "Failed to analyze ATS score. Please try again." 
    }, { status: 500 });
  }
}