import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';

export async function POST(request: NextRequest) {
  try {
    const form = await request.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",   // Most reliable on free tier
    });

    const systemPrompt = `You are an expert professional resume writer. 
Your task is to create a clean, modern, ATS-friendly resume.

**Important rules for experience bullets:**
- Turn responsibilities into strong achievement statements
- Start every bullet with an action verb (Led, Developed, Increased, Built, etc.)
- Quantify achievements whenever possible (e.g., "Increased revenue by 35%", "Managed team of 8")
- Keep each bullet to 1 line (max 100-120 characters)
- Make them specific and impactful

Output **ONLY** valid JSON with this exact structure (no extra text, no markdown):

{
  "name": string,
  "jobTitle": string,
  "contact": {
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string
  },
  "summary": string,
  "experience": [
    {
      "company": string,
      "role": string,
      "dates": string,
      "bullets": ["bullet 1", "bullet 2", "bullet 3", ...]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "dates": string
    }
  ],
  "skills": string[]
}`;

    const userPrompt = `User's raw information:\n${JSON.stringify(form, null, 2)}`;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const text = result.response.text();

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const resumeData = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return Response.json({ resume: resumeData });

  } catch (error: unknown) {
    console.error("Resume generation error:", error);
    return Response.json({ 
      error: getErrorMessage(error) || "Failed to generate resume. Please try again." 
    }, { status: 500 });
  }
}
