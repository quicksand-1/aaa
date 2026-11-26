const stringifyValue = (value) => {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value ?? null);
  } catch (error) {
    return String(value ?? '');
  }
};

const parseArguments = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

const buildRequestUrl = ({ baseUrl = '' }) =>
  `${String(baseUrl || '').replace(/\/$/, '')}/responses`;

const normalizeResponseTools = (tools = []) =>
  tools.map((tool) => ({
    ...tool,
    type: 'function',
  }));

const extractResponsesText = (data = {}) => {
  if (typeof data.output_text === 'string' && data.output_text) {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];

  return output
    .filter((item) => item?.type === 'message')
    .flatMap((item) => item?.content || [])
    .map((item) => item?.text || '')
    .filter(Boolean)
    .join('');
};

// 从 Responses API 返回的 output 中提取 function call。
//
// 这里最重要的字段是 callId：
// 1. 当模型决定调用某个工具时，会为这次调用生成一个 call_id；
// 2. 本地代码执行完工具后，必须把“同一个 call_id”连同工具输出一起回传；
// 3. 模型会据此判断这份 function_call_output 到底对应它先前发起的哪一次调用。
//
// 也就是说，call_id 不是业务参数，也不是给前端展示用的字段，
// 而是 function-calling 协议中的“关联键 / 对账键”：
// - function_call 是“发起调用”
// - function_call_output 是“返回结果”
// - call_id 负责把这两件事串起来
//
// 为什么这里要优先取 item.call_id，再退回 item.id？
// 因为不同兼容实现或网关返回的字段可能不完全一致。只要能拿到一个稳定 ID，
// 后续就可以把工具结果正确归还给模型。最后的 fallback 只是兜底，
// 防止在极端情况下因为缺 ID 导致本地数据结构不可用。
const extractResponsesToolCalls = (data = {}) => {
  const output = Array.isArray(data.output) ? data.output : [];

  return output
    .filter((item) => item?.type === 'function_call')
    .map((item, index) => ({
      callId: item.call_id || item.id || `responses-call-${index + 1}`,
      name: item.name || '',
      argumentsText: item.arguments || '{}',
      arguments: parseArguments(item.arguments),
      raw: item,
    }))
    .filter((item) => item.name);
};

const requestLLM = async ({ config = {}, body = {} }) => {
  const response = await fetch(buildRequestUrl({ baseUrl: config.baseUrl }), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'LLM 请求失败');
  }

  return data;
};

export const requestFunctionCallingTurn = async ({
  config = {},
  systemPrompt = '',
  userPrompt = '',
  tools = [],
}) => {
  if (!config?.baseUrl || !config?.apiKey || !config?.model) {
    throw new Error('请先配置 LLM 的 Base URL、API Key 和 Model');
  }

  const input = [
    {
      role: 'system',
      content: [{ type: 'input_text', text: systemPrompt }],
    },
    {
      role: 'user',
      content: [{ type: 'input_text', text: userPrompt }],
    },
  ];

  const data = await requestLLM({
    config,
    body: {
      model: config.model,
      input,
      tools: normalizeResponseTools(tools),
      tool_choice: 'auto',
    },
  });

  return {
    text: extractResponsesText(data),
    toolCalls: extractResponsesToolCalls(data),
    state: {
      tools,
      input,
      output: Array.isArray(data.output) ? data.output : [],
    },
    raw: data,
  };
};

export const appendFunctionCallOutputs = async ({
  config = {},
  state = {},
  toolOutputs = [],
}) => {
  // 把工具执行结果追加回下一轮 input。
  //
  // 这里必须回传 type = function_call_output + call_id：
  // - type 告诉模型：这不是新的用户消息，而是某次工具调用的执行结果
  // - call_id 告诉模型：这份结果对应的是哪一次 function_call
  //
  // 如果一轮里模型发起了多个工具调用，而我们回传结果时不带 call_id，
  // 模型就无法可靠地区分：
  // - 哪个结果属于哪个工具调用
  // - 某个调用是否已经收到结果
  // - 后续应该基于哪份结果继续推理
  //
  // 因此 call_id 在这里不能重新生成，也不能丢失，必须透传模型原始返回的 ID。
  const nextInput = [
    ...(Array.isArray(state.input) ? state.input : []),
    ...(Array.isArray(state.output) ? state.output : []),
    ...toolOutputs.map((item) => ({
      type: 'function_call_output',
      call_id: item.callId,
      output: stringifyValue(item.output),
    })),
  ];

  const data = await requestLLM({
    config,
    body: {
      model: config.model,
      input: nextInput,
      tools: normalizeResponseTools(state.tools || []),
      tool_choice: 'auto',
    },
  });

  return {
    text: extractResponsesText(data),
    toolCalls: extractResponsesToolCalls(data),
    state: {
      tools: state.tools || [],
      input: nextInput,
      output: Array.isArray(data.output) ? data.output : [],
    },
    raw: data,
  };
};
