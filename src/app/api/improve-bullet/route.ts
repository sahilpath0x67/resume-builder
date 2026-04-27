import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { bullet, role, company } = await request.json();

    if (!bullet) {
      return Response.json({ 
        error: "Bullet point is required" 
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite" 
    });

    const prompt = `You are a professional resume writer. Rewrite this resume bullet point to be stronger, more quantified, and ATS-friendly.

Original bullet: "${bullet}"
Role: ${role || 'not specified'}
Company: ${company || 'not specified'}

Rules:
- Start with a strong action verb (Led, Increased, Developed, Built, Optimized, etc.)
- Add specific metrics or numbers if possible (estimate realistically using ~ or "over" if needed)
- Keep it concise (under 20-25 words)
- Make it achievement-oriented and impactful
- Use past tense for completed work

Respond with **ONLY** the improved bullet text. 
No quotes, no explanation, no JSON, no extra words. Just the single improved bullet.`;

    const result = await model.generateContent(prompt);
    const improved = result.response.text().trim();

    return Response.json({ improved });

  } catch (error: any) {
    console.error("Improve bullet error:", error);
    return Response.json({ 
      error: "Failed to improve bullet point. Please try again." 
    }, { status: 500 });
  }
}