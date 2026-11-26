import {
  getCapabilitySlotLabel,
  mergeCapabilitySlots,
  normalizeCapabilitySlots,
  pickCapabilitySlotPatch,
} from './capabilitySlots';
import { formatRecentHistory } from './historyManager';
import { createStep } from './stepLogger';

export const AGENT_CLARIFY_TOOL_NAME = 'agent_clarify';

const schemaAllowsNull = (schema = {}) => {
  if (Array.isArray(schema?.type)) {
    return schema.type.includes('null');
  }

  if (Array.isArray(schema?.anyOf)) {
    return schema.anyOf.some((item) => schemaAllowsNull(item));
  }

  return schema?.type === 'null';
};

const buildCapabilitySlotSummary = (capability = {}) =>
  Object.entries(capability?.slots || {})
    .map(([slotKey, slot]) => `- ${slotKey}: ${slot?.label || slotKey}`)
    .join('\n');

const buildCapabilityClarifyPrompt = (capability = {}) => {
  const entityLabel = capability?.entity?.label || '对象';
  const slotSummary = buildCapabilitySlotSummary(capability);

  return [
    '# Agent Runtime Clarify Rules',
    `- 信息不足时，不要直接输出普通文本追问，必须调用 ${AGENT_CLARIFY_TOOL_NAME}。`,
    `- 如果当前能力需要先定位${entityLabel}，但上下文还不能唯一确定，也必须调用 ${AGENT_CLARIFY_TOOL_NAME}。`,
    `- 调用 ${AGENT_CLARIFY_TOOL_NAME} 时：question 要直接面向用户，intent 要填写当前未完成意图，missingSlots 要只包含真正缺失的 slot。`,
    '- slots 字段要带上当前已经确认的 slot，方便用户下一轮补充后继续推进。',
    '- 如果已有工具结果足够回答，就直接输出最终答案，不要继续澄清。',
    slotSummary ? `可用于澄清的 slots：\n${slotSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

export const buildCapabilitySystemPrompt = (capability = {}) =>
  [capability.systemPrompt || '', buildCapabilityClarifyPrompt(capability)]
    .filter(Boolean)
    .join('\n\n');

const buildAgentClarifyToolParameters = (capability = {}) => {
  const slotProperties = Object.entries(capability?.slots || {}).reduce(
    (acc, [key, slot]) => {
      acc[key] = slot?.schema || {
        type: ['string', 'null'],
      };
      return acc;
    },
    {},
  );

  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      question: {
        type: 'string',
        description: '要继续向用户追问的具体问题。',
      },
      reason: {
        type: ['string', 'null'],
        description: '触发澄清的原因，可为空。',
      },
      intent: {
        type: ['string', 'null'],
        description: '当前要继续完成的意图，可为空。',
      },
      missingSlots: {
        type: 'array',
        items: {
          type: 'string',
          enum: Object.keys(capability?.slots || {}),
        },
      },
      slots: {
        type: 'object',
        additionalProperties: false,
        properties: slotProperties,
        required: Object.keys(slotProperties),
      },
    },
    required: ['question', 'reason', 'intent', 'missingSlots', 'slots'],
  };
};

export const buildAgentClarifyTool = (capability = {}) => ({
  type: 'function',
  name: AGENT_CLARIFY_TOOL_NAME,
  description:
    '当缺少关键信息、无法唯一确定查询对象，或必须让用户补充参数时，使用这个工具发起澄清。',
  strict: true,
  parameters: buildAgentClarifyToolParameters(capability),
});

const getToolParameterProperties = (tool = {}) =>
  tool?.parameters?.properties || {};

const getToolRequiredSlotKeys = ({ capability = {}, tool = {} }) => {
  if (Array.isArray(tool.requiredSlots)) {
    return tool.requiredSlots;
  }

  const requiredKeys = Array.isArray(tool?.parameters?.required)
    ? tool.parameters.required
    : [];
  const slotKeys = Object.keys(capability?.slots || {});
  const parameterProperties = getToolParameterProperties(tool);

  return requiredKeys.filter((key) => {
    if (!slotKeys.includes(key)) {
      return false;
    }

    if (tool.usesEntity && key === capability?.entity?.idSlot) {
      return false;
    }

    return !schemaAllowsNull(parameterProperties[key]);
  });
};

const buildToolOutput = ({
  tool = '',
  input = {},
  data,
  error = '',
  meta = {},
}) => ({
  ok: !error,
  tool,
  input,
  ...(error ? { error } : { data }),
  ...meta,
});

const buildToolStep = ({
  step = 1,
  tool = '',
  input = {},
  resultCount,
  error = '',
}) =>
  createStep(step, 'call_tool', {
    tool,
    input,
    ...(typeof resultCount === 'number' ? { resultCount } : {}),
    ...(error ? { error } : {}),
  });

const findEntityById = ({
  capability = {},
  entityId = '',
  loopState = {},
  sessionState = {},
}) => {
  const entity = capability?.entity || {};
  const allKeys = [entity.idKey, ...(entity.aliasIdKeys || [])].filter(Boolean);
  const candidates = [
    loopState?.currentEntity,
    ...(loopState?.searchCandidates || []),
    sessionState?.capabilities?.[capability.id]?.currentEntity,
    sessionState?.currentEntity,
  ].filter(Boolean);

  if (!entityId) {
    return candidates[0] || null;
  }

  return (
    candidates.find((item) =>
      allKeys.some((key) => String(item?.[key] || '') === String(entityId)),
    ) || null
  );
};

export const buildCapabilityInitialLoopState = ({
  capability = {},
  sessionState = {},
}) => {
  const capabilityState = sessionState?.capabilities?.[capability.id] || {};
  const pendingClarify =
    sessionState?.pendingClarify?.capabilityId === capability.id
      ? sessionState.pendingClarify
      : null;

  return {
    intent:
      pendingClarify?.intent ||
      capabilityState.intent ||
      capability.defaultIntent,
    slots: normalizeCapabilitySlots({
      capability,
      slots: {
        ...(capabilityState.slots || {}),
        ...(pendingClarify?.slots || {}),
      },
    }),
    currentEntity:
      capabilityState.currentEntity || sessionState?.currentEntity || null,
    searchCandidates: Array.isArray(capabilityState.searchCandidates)
      ? capabilityState.searchCandidates
      : [],
    searchAttempted: Boolean(capabilityState.searchAttempted),
  };
};

export const buildCapabilityUserPrompt = ({
  capability = {},
  question = '',
  sessionState = {},
  loopState = {},
}) => {
  const lines = [];
  const currentEntity = loopState?.currentEntity;
  const entityLabel = capability?.entity?.label || '对象';
  const entityName = currentEntity?.[capability?.entity?.displayKey || 'name'];
  const entityId = currentEntity?.[capability?.entity?.idKey || 'id'];
  const pendingClarify =
    sessionState?.pendingClarify?.capabilityId === capability.id
      ? sessionState.pendingClarify
      : null;
  const recentHistory = formatRecentHistory({
    memory: sessionState?.memory,
  });

  lines.push(
    currentEntity
      ? `当前已锁定${entityLabel}：${entityName || ''} ${
          entityId ? `(${entityId})` : ''
        }`.trim()
      : `当前已锁定${entityLabel}：无`,
  );

  if (loopState?.intent) {
    lines.push(`当前识别意图：${loopState.intent}`);
  }

  lines.push(
    `当前已知槽位：\n${JSON.stringify(loopState?.slots || {}, null, 2)}`,
  );

  if (pendingClarify?.question) {
    lines.push(`上一轮待补充问题：${pendingClarify.question}`);
  }

  if (pendingClarify?.missingSlots?.length) {
    lines.push(`待补充字段：${pendingClarify.missingSlots.join(', ')}`);
  }

  if (recentHistory) {
    lines.push(`最近对话：\n${recentHistory}`);
  }

  lines.push(`用户本轮问题：\n${question}`);

  return lines.join('\n\n');
};

const buildCapabilitySnapshot = ({ capability = {}, loopState = {} }) => ({
  intent: loopState?.intent || capability.defaultIntent,
  slots: normalizeCapabilitySlots({
    capability,
    slots: loopState?.slots || {},
  }),
  currentEntity: loopState?.currentEntity || null,
  searchCandidates: Array.isArray(loopState?.searchCandidates)
    ? loopState.searchCandidates
    : [],
  searchAttempted: Boolean(loopState?.searchAttempted),
});

export const buildCapabilitySessionArtifacts = ({
  capability = {},
  loopState = {},
  activeCapability = '',
}) => {
  const snapshot = buildCapabilitySnapshot({
    capability,
    loopState,
  });
  const currentEntity = snapshot.currentEntity || null;

  return {
    parsed: {
      intent: snapshot.intent,
      slots: snapshot.slots,
    },
    currentEntity,
    sessionPatch: {
      activeCapability: activeCapability || capability.id,
      currentEntity,
      capabilities: {
        [capability.id]: snapshot,
      },
    },
  };
};

const buildCapabilityClarifyResult = ({
  step = 1,
  tool = AGENT_CLARIFY_TOOL_NAME,
  answer = '请补充更多查询条件。',
  missingSlots = [],
  patch = {},
  stepInput = {},
}) => ({
  type: 'clarify',
  step: buildToolStep({
    step,
    tool,
    input: stepInput,
  }),
  answer,
  clarifyIntent: patch?.intent || null,
  missingSlots,
  loopStatePatch: patch,
});

const buildClarifyPatch = ({
  capability = {},
  intent = '',
  loopState = {},
  slotPatch = {},
}) => ({
  intent: intent || loopState?.intent || capability.defaultIntent,
  slots: mergeCapabilitySlots({
    capability,
    currentSlots: loopState?.slots || {},
    nextSlots: slotPatch,
  }),
  currentEntity: loopState?.currentEntity || null,
  searchCandidates: loopState?.searchCandidates || [],
  searchAttempted: Boolean(loopState?.searchAttempted),
});

const buildMissingEntityQuestion = (capability = {}) => {
  const entityLabel = capability?.entity?.label || '对象';
  const lookupSlotKeys = Array.isArray(capability?.entity?.lookupSlots)
    ? capability.entity.lookupSlots
    : [capability?.entity?.idSlot].filter(Boolean);
  const lookupLabels = lookupSlotKeys
    .map((slotKey) =>
      getCapabilitySlotLabel({
        capability,
        slotKey,
      }),
    )
    .filter(Boolean);

  if (lookupLabels.length === 1) {
    return `请先补充${lookupLabels[0]}，以便定位${entityLabel}。`;
  }

  if (lookupLabels.length > 1) {
    return `请先补充${lookupLabels.join('或')}，以便定位${entityLabel}。`;
  }

  return `请先告诉我要查询哪个${entityLabel}。`;
};

const buildMissingSlotQuestion = ({ capability = {}, missingSlots = [] }) =>
  `请补充${missingSlots
    .map((slotKey) =>
      getCapabilitySlotLabel({
        capability,
        slotKey,
      }),
    )
    .join('、')}。`;

const buildToolExecutionResult = ({
  step = 1,
  tool = '',
  result = {},
  patch = {},
  outputInput = {},
}) => {
  const error = result?.error || '';

  return {
    type: 'tool_output',
    step: buildToolStep({
      step,
      tool,
      input: outputInput,
      resultCount:
        typeof result?.resultCount === 'number'
          ? result.resultCount
          : undefined,
      error,
    }),
    output: buildToolOutput({
      tool,
      input: outputInput,
      data: result?.data,
      error,
      meta:
        typeof result?.resultCount === 'number'
          ? {
              resultCount: result.resultCount,
            }
          : {},
    }),
    loopStatePatch: patch,
  };
};

const buildDefaultPatch = ({
  capability = {},
  tool = {},
  loopState = {},
  mergedSlots = {},
  currentEntity = null,
}) => ({
  intent: tool.intent || loopState?.intent || capability.defaultIntent,
  slots: mergeCapabilitySlots({
    capability,
    currentSlots: loopState?.slots || {},
    nextSlots: mergedSlots,
  }),
  currentEntity: currentEntity || loopState?.currentEntity || null,
  searchCandidates: loopState?.searchCandidates || [],
  searchAttempted: Boolean(loopState?.searchAttempted || tool.usesEntity),
});

export const executeCapabilityToolCall = async ({
  capability = {},
  toolCall = {},
  loopState = {},
  sessionState = {},
  step = 1,
}) => {
  const toolName = toolCall?.name || '';
  const args = toolCall?.arguments || {};
  const tool =
    (capability?.tools || []).find((item) => item.name === toolName) || null;

  if (toolName === AGENT_CLARIFY_TOOL_NAME) {
    return buildCapabilityClarifyResult({
      step,
      tool: toolName,
      answer: args.question || '请补充更多查询条件。',
      missingSlots: Array.isArray(args.missingSlots) ? args.missingSlots : [],
      stepInput: args,
      patch: buildClarifyPatch({
        capability,
        intent: args.intent || loopState?.intent || capability.defaultIntent,
        loopState,
        slotPatch: args.slots || {},
      }),
    });
  }

  if (!tool) {
    return buildToolExecutionResult({
      step,
      tool: toolName,
      outputInput: args,
      result: {
        error: `未识别的工具：${toolName}`,
      },
      patch: buildDefaultPatch({
        capability,
        loopState,
        mergedSlots: pickCapabilitySlotPatch({
          capability,
          args,
        }),
      }),
    });
  }

  const normalizedArgs =
    typeof tool.normalizeArgs === 'function' ? tool.normalizeArgs(args) : args;
  const slotPatch = pickCapabilitySlotPatch({
    capability,
    args: normalizedArgs,
  });
  const mergedSlots = mergeCapabilitySlots({
    capability,
    currentSlots: loopState?.slots || {},
    nextSlots: slotPatch,
  });
  const entityId =
    tool.usesEntity && capability?.entity?.idSlot
      ? mergedSlots?.[capability.entity.idSlot] || null
      : null;
  const currentEntity = tool.usesEntity
    ? findEntityById({
        capability,
        entityId,
        loopState,
        sessionState,
      })
    : null;
  const missingSlots = getToolRequiredSlotKeys({
    capability,
    tool,
  }).filter((slotKey) => !mergedSlots?.[slotKey]);

  if (tool.usesEntity && !entityId) {
    return buildCapabilityClarifyResult({
      step,
      tool: toolName,
      answer: buildMissingEntityQuestion(capability),
      missingSlots: capability?.entity?.idSlot
        ? [capability.entity.idSlot]
        : [],
      stepInput: normalizedArgs,
      patch: buildClarifyPatch({
        capability,
        intent: tool.intent,
        loopState,
        slotPatch,
      }),
    });
  }

  if (missingSlots.length) {
    return buildCapabilityClarifyResult({
      step,
      tool: toolName,
      answer: buildMissingSlotQuestion({
        capability,
        missingSlots,
      }),
      missingSlots,
      stepInput: normalizedArgs,
      patch: buildClarifyPatch({
        capability,
        intent: tool.intent,
        loopState,
        slotPatch,
      }),
    });
  }

  const result = await tool.execute({
    args: normalizedArgs,
    slots: mergedSlots,
    entityId,
    currentEntity,
    loopState,
    sessionState,
  });

  const patch =
    tool.kind === 'entity.search'
      ? {
          intent: tool.intent || capability.defaultIntent,
          slots: mergeCapabilitySlots({
            capability,
            currentSlots: loopState?.slots || {},
            nextSlots: {
              ...mergedSlots,
              ...(capability?.entity?.idSlot
                ? {
                    [capability.entity.idSlot]:
                      Array.isArray(result?.data) &&
                      result.data.length === 1 &&
                      result.data[0]?.[capability.entity.idKey]
                        ? result.data[0][capability.entity.idKey]
                        : null,
                  }
                : {}),
            },
          }),
          currentEntity:
            Array.isArray(result?.data) &&
            result.data.length === 1 &&
            result.data[0]
              ? result.data[0]
              : null,
          searchCandidates: Array.isArray(result?.data) ? result.data : [],
          searchAttempted: true,
        }
      : buildDefaultPatch({
          capability,
          tool,
          loopState,
          mergedSlots,
          currentEntity: result?.currentEntity || currentEntity,
        });

  return buildToolExecutionResult({
    step,
    tool: toolName,
    outputInput:
      typeof tool.buildOutputInput === 'function'
        ? tool.buildOutputInput({
            args: normalizedArgs,
            slots: mergedSlots,
            entityId,
          })
        : normalizedArgs,
    result,
    patch:
      typeof tool.buildPatch === 'function'
        ? tool.buildPatch({
            args: normalizedArgs,
            slots: mergedSlots,
            result,
            basePatch: patch,
            entityId,
            currentEntity,
            loopState,
            sessionState,
          }) || patch
        : patch,
  });
};
