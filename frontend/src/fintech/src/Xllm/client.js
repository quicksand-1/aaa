const extractResponsesText = (data = {}) => {
  if (typeof data.output_text === 'string' && data.output_text) {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  const chunks = output.flatMap((item) => item?.content || []);

  return chunks
    .map((item) => item?.text || item?.content?.[0]?.text || '')
    .filter(Boolean)
    .join('');
};

const buildRequestUrl = ({ baseUrl = '' }) => {
  const root = baseUrl.replace(/\/$/, '');
  return `${root}/responses`;
};

const validateLLMConfig = (config = {}) => {
  if (!config.baseUrl || !config.apiKey || !config.model) {
    throw new Error('请先配置 LLM 的 Base URL、API Key 和 Model');
  }
};

const buildTestRequestBody = ({ model }) => {
  return {
    model,
    input: [
      {
        role: 'user',
        content: [{ type: 'input_text', text: 'Reply with OK only.' }],
      },
    ],
  };
};

export const testLLMConfigConnection = async (config = {}) => {
  validateLLMConfig(config);

  const response = await fetch(buildRequestUrl({ baseUrl: config.baseUrl }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(
      buildTestRequestBody({
        model: config.model,
      }),
    ),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || '网络测试失败');
  }

  return {
    content: extractResponsesText(data) || '连接成功',
    data,
  };
};
