import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// We initialize OpenAI client with the Grok Base URL and the user's xAI key
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export async function POST(req: Request) {
  try {
    const { query, messages, chatContext } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const systemPrompt = `You are ThreadLens AI, an emotional intelligence and relationship analytics assistant. 
You are given a raw WhatsApp chat transcript between two or more people.
Your job is to answer the user's question about the conversation dynamics, who said what, emotional patterns, etc.
Be concise, insightful, and maintain a premium, intelligent tone.
If the question is about who said sorry more, count the instances accurately.

Here is the conversation context:
${chatContext}`;

    const completion = await openai.chat.completions.create({
      model: 'grok-4.20-0309-non-reasoning', // Using the latest supported xAI model
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: query }
      ],
      temperature: 0.2,
    });

    const usage = completion.usage;
    
    // Approximate Grok pricing (e.g., $5 per 1M input tokens, $15 per 1M output tokens)
    let costEstimate = 0;
    if (usage) {
      const inputCost = (usage.prompt_tokens / 1000000) * 5.0;
      const outputCost = (usage.completion_tokens / 1000000) * 15.0;
      costEstimate = inputCost + outputCost;
    }

    return NextResponse.json({ 
      reply: completion.choices[0].message.content,
      usage: usage,
      costEstimate: costEstimate.toFixed(5)
    });
  } catch (error: any) {
    console.error('Error calling xAI API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
