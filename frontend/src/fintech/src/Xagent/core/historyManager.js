export const DEFAULT_AGENT_MEMORY_STATE = {
  turns: [],
};

const truncateText = (value = '', maxLength = 160) => {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
};

export const appendHistoryTurns = ({
  memory = DEFAULT_AGENT_MEMORY_STATE,
  turns = [],
  maxTurns = 12,
}) => {
  const nextTurns = [...(memory?.turns || []), ...turns].slice(-maxTurns);

  return {
    ...DEFAULT_AGENT_MEMORY_STATE,
    ...memory,
    turns: nextTurns,
  };
};

export const buildHistoryPatch = ({
  sessionState = {},
  question = '',
  answer = '',
  parsed = {},
  result = {},
}) => ({
  memory: appendHistoryTurns({
    memory: sessionState.memory,
    turns: [
      {
        role: 'user',
        content: truncateText(question, 200),
        createdAt: Date.now(),
      },
      {
        role: 'assistant',
        content: truncateText(answer || '', 240),
        intent: parsed?.intent || '',
        resultType: result?.type || '',
        mode: result?.mode || '',
        createdAt: Date.now(),
      },
    ],
  }),
});

export const formatRecentHistory = ({
  memory = DEFAULT_AGENT_MEMORY_STATE,
  limit = 4,
}) => {
  const recentTurns = (memory?.turns || []).slice(-limit);

  if (!recentTurns.length) {
    return '';
  }

  return recentTurns
    .map((item) => `${item.role === 'user' ? '用户' : '助手'}：${item.content}`)
    .join('\n');
};
