const API_TOKEN_TEST_CHANNEL_TYPES = new Set(['MCP', 'WEB']);

/**
 * 构造秘钥测试请求的最小请求头。
 *
 * 渠道为空时保持 general-system 普通接口的既有调用方式；Wiki API Token 调用必须显式
 * 选择 WEB 或 MCP，不能接受任意字符串伪造渠道身份。
 *
 * @param {string} token 用户输入的 API Token
 * @param {string} channelType 可选的 Wiki 渠道
 * @returns {Record<string, string>} 可直接传给 fetch 的请求头
 * @throws {Error} 渠道不为空但不属于当前 API Token 支持的渠道时抛出
 */
export function buildApiTokenTestHeaders(token, channelType) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${String(token || '').trim()}`,
  };
  const normalizedChannelType = String(channelType || '').trim();
  if (!normalizedChannelType) return headers;

  if (!API_TOKEN_TEST_CHANNEL_TYPES.has(normalizedChannelType)) {
    throw new Error('请求渠道仅支持 WEB 或 MCP');
  }
  return {
    ...headers,
    'X-Channel-Type': normalizedChannelType,
  };
}
