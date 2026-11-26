import { createAgentRunner, DEFAULT_AGENT_SESSION_STATE } from 'fintech/x';
import { AGENT_CAPABILITIES } from './capabilities';

export { DEFAULT_AGENT_SESSION_STATE };

export const runAgent = createAgentRunner({
  capabilities: AGENT_CAPABILITIES,
  api: {
    baseUrl: 'http://openai.abssqr.cn/v1',
    apiKey: 'sk-vKZTKuEbi0XCMYNixc0mhzK5lAx6BgEocvQZJipD9sda9Pf3',
    model: 'deepseek-v4-flash',
  },
});
