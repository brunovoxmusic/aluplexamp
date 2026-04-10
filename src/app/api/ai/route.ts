import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action || !data) {
      return NextResponse.json(
        { error: 'Missing action or data' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const systemPrompt = `You are Flowd AI, a friendly and knowledgeable productivity assistant integrated into the Flowd productivity app. Your role is to help users:

1. Plan their day and prioritize tasks
2. Build and maintain habits
3. Improve focus and time management
4. Provide actionable productivity advice
5. Analyze their task list and suggest improvements

Be concise, actionable, and encouraging. Use bullet points or numbered lists when giving steps. Keep responses under 200 words unless specifically asked for detail. Always be supportive and never judgmental.

Current user context:
- Name: ${data.context?.userName || 'User'}
- Level: ${data.context?.level || 1}
- XP: ${data.context?.xp || 0}
- Day streak: ${data.context?.streak || 0}
- Tasks: ${JSON.stringify(data.context?.tasks || [])}
- Habits: ${JSON.stringify(data.context?.habits || [])}`;

    let userMessage = '';

    switch (action) {
      case 'plan':
        userMessage = `Create a daily plan for me. Here's what I have:\nTasks: ${JSON.stringify(data.context?.tasks || [])}\nHabits: ${JSON.stringify(data.context?.habits || [])}\nHelp me organize my day optimally.`;
        break;
      case 'breakdown':
        userMessage = `Break down this task into smaller steps: "${data.task || data.message}"`;
        break;
      case 'feedback':
        userMessage = `Give me feedback on my productivity: ${JSON.stringify(data.context || {})}`;
        break;
      case 'chat':
      default:
        userMessage = data.message || 'Hello!';
        break;
    }

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const aiResponse = response.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
