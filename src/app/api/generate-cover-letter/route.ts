import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription, companyName, hiringManager } = await request.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite", 
    });

    const prompt = `Write a concise, professional cover letter (3-4 short paragraphs) tailored to this job.

Company: ${companyName || 'the company'}
Hiring Manager: ${hiringManager || 'Hiring Manager'}
Job Description: ${jobDescription}

User's Resume:
${JSON.stringify(resume, null, 2)}

Make it enthusiastic, natural, and highlight the most relevant experience.`;

    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    return Response.json({ coverLetter });

  } catch (error: any) {
    console.error(error);
    return Response.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}