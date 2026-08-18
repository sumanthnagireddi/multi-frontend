import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1]?.content || 'something';

  // Create a dummy stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const dummyResponse = `This is a dummy response! You just said: "${lastMessage}".\n\n(Real API calls will be added later.)`;
      
      // Simulate streaming word by word
      const words = dummyResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        // AI SDK DataStream format uses '0:"text"\n'
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay per word
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-vercel-ai-data-stream': 'v1',
    },
  });
}
