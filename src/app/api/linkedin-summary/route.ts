import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';

export async function POST(request: NextRequest) {
  try {
    const { resume } = await request.json();

    if (!resume) {
      return Response.json({ error: 'Resume data is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `You are an expert LinkedIn profile writer and personal branding specialist.

Write a compelling LinkedIn "About" section in the first person based on this resume:

${JSON.stringify(resume, null, 2)}

Guidelines:
- Write in first person ("I" statements)
- Start with a strong engaging opening hook
- Highlight key achievements with quantifiable results where possible
- Show personality while remaining professional
- Keep total length between 1800 and 2600 characters
- Use 3-5 natural paragraphs
- End with a call-to-action or forward-looking statement
- Avoid generic buzzwords

Output ONLY the About section text — no headings, no labels, no extra commentary.`;

    const result = await model.generateContent(prompt);
    const linkedin = result.response.text().trim();

    if (!linkedin) {
      throw new Error('AI returned an empty response. Please try again.');
    }

    // Return as `linkedin` key — matches what LinkedInPanel expects
    return Response.json({ linkedin });

  } catch (error: unknown) {
    console.error('LinkedIn generation error:', error);
    return Response.json(
      { error: getErrorMessage(error) || 'Failed to generate LinkedIn About section. Please try again.' },
      { status: 500 }
    );
  }
}