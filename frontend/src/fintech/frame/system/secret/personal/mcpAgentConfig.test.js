import { describe, expect, test } from 'vitest';
import {
  buildMcpAgentConfig,
  buildMcpAgentConfigText,
  validateMcpClientConfig,
} from './mcpAgentConfig';

const mcpClientConfig = {
  serverName: 'enterprise-wiki-test',
  type: 'streamable-http',
  url: 'https://mcp.example.test/mcp',
};

describe('mcpAgentConfig', () => {
  test('builds an external Agent config with the configured MCP URL and secret', () => {
    expect(buildMcpAgentConfig(mcpClientConfig, 'gs_at_test_token')).toEqual({
      mcpServers: {
        'enterprise-wiki-test': {
          type: 'streamable-http',
          url: 'https://mcp.example.test/mcp',
          headers: {
            Authorization: 'Bearer gs_at_test_token',
          },
          disabled: false,
        },
      },
    });
  });

  test('serializes the config as valid readable JSON without Markdown artifacts', () => {
    const text = buildMcpAgentConfigText(mcpClientConfig, 'gs_at_test_token');

    expect(JSON.parse(text)).toEqual(
      buildMcpAgentConfig(mcpClientConfig, 'gs_at_test_token'),
    );
    expect(text).not.toContain('[https://');
    expect(text).not.toContain('gs\\_at');
    expect(text).toContain('\n  "mcpServers"');
  });

  test.each([
    null,
    {},
    { ...mcpClientConfig, serverName: ' ' },
    { ...mcpClientConfig, type: '' },
    { ...mcpClientConfig, url: null },
  ])('rejects incomplete backend metadata %#', (config) => {
    expect(() => validateMcpClientConfig(config)).toThrow(
      'MCP 客户端配置响应不完整',
    );
  });
});
