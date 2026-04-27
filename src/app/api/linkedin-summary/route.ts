import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { resume } = await request.json();

    if (!resume) {
      return Response.json({ 
        error: "Resume data is required" 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite" 
    });

    const prompt = `You are an expert LinkedIn profile writer and personal branding specialist.

Write a compelling, professional "About" section (LinkedIn bio) in the **first person** based on the candidate's resume.

**Resume Data:**
${JSON.stringify(resume, null, 2)}

**Guidelines for a great LinkedIn About section:**
- Write in first person ("I" statements)
- Start with a strong, engaging opening line (hook)
- Highlight key achievements with quantifiable results
- Show personality while remaining professional
- Include what you're passionate about and what you're looking for next
- Keep total length between 1800 - 2600 characters (ideal LinkedIn range)
- Use natural paragraphs (3-5 paragraphs)
- End with a call-to-action or forward-looking statement

Make it authentic, confident, and engaging. Avoid generic buzzwords.`;

    const result = await model.generateContent(prompt);
    const aboutText = result.response.text().trim();

    return Response.json({ 
      about: aboutText 
    });

  } catch (error: any) {
    console.error("LinkedIn generation error:", error);
    return Response.json({ 
      error: error.message || "Failed to generate LinkedIn About section. Please try again." 
    }, { status: 500 });
  }
}