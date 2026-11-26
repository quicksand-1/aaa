export function validateMcpClientConfig(config) {
  if (
    !config ||
    !['serverName', 'type', 'url'].every(
      (key) => typeof config[key] === 'string' && config[key].trim(),
    )
  ) {
    throw new Error('MCP 客户端配置响应不完整');
  }

  return config;
}

export function buildMcpAgentConfig(config, secret) {
  const { serverName, type, url } = validateMcpClientConfig(config);

  return {
    mcpServers: {
      [serverName]: {
        type,
        url,
        headers: {
          Authorization: `Bearer ${secret}`,
        },
        disabled: false,
      },
    },
  };
}

export function buildMcpAgentConfigText(config, secret) {
  return JSON.stringify(buildMcpAgentConfig(config, secret), null, 2);
}
