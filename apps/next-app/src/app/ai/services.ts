export type AgentMode = 'chat' | 'plan' | 'build';

export interface AgentRequest {
  message: string;
  model: string;
  mode: AgentMode;
  webSearch: boolean;
  deepReasoning: boolean;
  attachments: string[];
}

const wait = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

export const agentService = {
  async createAgentResponse(request: AgentRequest): Promise<string> {
    await wait(350);

    const attachmentText = request.attachments.length
      ? `\n\nI also detected these attachments: ${request.attachments.join(', ')}.`
      : '';
    const researchText = request.webSearch ? '\n\nResearch status: live web sources would be checked here.' : '';
    const depthText = request.deepReasoning ? '\n\nReasoning depth: extended analysis enabled.' : '';

    if (request.mode === 'plan') {
      return [
        'Here is a practical implementation plan:',
        '',
        '1. Confirm the current architecture and expected behavior.',
        '2. Define the smallest safe implementation slice.',
        '3. Implement and add focused unit/integration coverage.',
        '4. Validate the build, run the test suite, and review edge cases.',
        '5. Document the result and prepare rollout steps.',
        '',
        `Goal: ${request.message}`,
        `${attachmentText}${researchText}${depthText}`,
      ].join('\n');
    }

    if (request.mode === 'build') {
      return [
        'I would implement this as a small, typed service-module change with UI integration kept separate.',
        '',
        'Implementation approach:',
        '- Define the service contract first.',
        '- Add mock response data and predictable mutation behavior.',
        '- Connect the UI to the service methods.',
        '- Add loading, empty, error, and retry states.',
        '- Add focused tests before swapping in the real API.',
        '',
        `Requested work: ${request.message}`,
        `${attachmentText}${researchText}${depthText}`,
      ].join('\n');
    }

    return [
      `I’m working on: ${request.message}`,
      '',
      `Using ${request.model}, I would first inspect the relevant inputs, identify assumptions, and break the request into verifiable steps. This mock service keeps the product flow testable until the real backend is connected.`,
      `${attachmentText}${researchText}${depthText}`,
    ].join('\n');
  },
};
