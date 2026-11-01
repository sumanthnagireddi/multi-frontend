import { agentService } from '../../ai/services';

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model = 'gemini-2.5-flash',
    mode = 'chat',
    webSearch = false,
    deepReasoning = false,
    attachments = [],
  } = await req.json();

  const lastMessage = messages[messages.length - 1]?.content || 'your request';
  const response = await agentService.createAgentResponse({
    message: lastMessage,
    model,
    mode,
    webSearch,
    deepReasoning,
    attachments,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of response.split(/(\s+)/)) {
        controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));
        await new Promise(resolve => setTimeout(resolve, 28));
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
