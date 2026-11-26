import { selectAgentCapability } from './core/capabilityRouter';
import {
  buildAgentClarifyTool,
  buildCapabilityInitialLoopState,
  buildCapabilitySessionArtifacts,
  buildCapabilitySystemPrompt,
  buildCapabilityUserPrompt,
  executeCapabilityToolCall,
} from './core/capabilityRuntime';
import { buildHistoryPatch } from './core/historyManager';
import { runFunctionCallingAgent } from './core/runFunctionCallingAgent';
import { buildClarifyState, buildNextSessionState } from './core/sessionState';

// 校验最小可用的 LLM 配置。
// createAgentRunner 允许调用方在初始化时传一份默认配置，
// 也允许在每次运行时覆盖，因此这里统一用最基础的字段判断
// 当前这份配置是否足以发起一次模型调用。
const isValidLLMConfig = (config = {}) =>
  Boolean(config?.baseUrl && config?.apiKey && config?.model);

// 为最终结果补齐 activeCapability，确保上层无论收到 success / clarify / error
// 哪种结果，都能从 sessionState 中明确知道本轮实际命中的 capability。
// 这里采用“尽量补齐、不破坏已有结构”的策略：
// 1. 如果 result 没有 sessionState，则保持原状；
// 2. 如果调用方显式传入 capabilityId，则优先使用；
// 3. 否则回退到原有 sessionState.activeCapability。
const withActiveCapability = (result, capabilityId = '') => ({
  ...result,
  sessionState: result?.sessionState
    ? {
        ...result.sessionState,
        activeCapability:
          capabilityId || result.sessionState.activeCapability || null,
      }
    : result.sessionState,
});

// 所有 capability 的 tool 会被汇总到同一个 function-calling agent 内部使用，
// 因此 tool name 必须全局唯一。
// 如果不同 capability 注册了同名 tool，模型在 function call 时将无法可靠区分，
// 最终会造成路由歧义或错误执行，所以这里在运行前直接 fail fast。
const ensureUniqueToolNames = (capabilities = []) => {
  const duplicatedToolNames = capabilities.reduce(
    (acc, capability) => {
      (capability.tools || []).forEach((tool) => {
        const toolName = tool?.name;

        if (!toolName) {
          return;
        }

        if (acc.seen[toolName]) {
          acc.duplicates.add(toolName);
          return;
        }

        acc.seen[toolName] = true;
      });

      return acc;
    },
    {
      seen: {},
      duplicates: new Set(),
    },
  );

  if (duplicatedToolNames.duplicates.size) {
    throw new Error(
      `Agent tools 存在重复名称：${Array.from(
        duplicatedToolNames.duplicates,
      ).join('、')}`,
    );
  }
};

// createAgentRunner 本身是一个“工厂函数”：
// - 第一层接收系统初始化阶段的静态配置，比如 capability 列表、默认 API 配置；
// - 第二层返回真正执行 agent 的 runner，处理每次用户提问时的动态上下文。
export const createAgentRunner = ({
  capabilities: configuredCapabilities = [],
  api: configuredAPI,
  maxLoops = 6,
  selectCapability = selectAgentCapability,
} = {}) => {
  if (typeof selectCapability !== 'function') {
    throw new Error('createAgentRunner 缺少 selectCapability 实现');
  }

  return async ({
    question = '',
    sessionState = {},
    llmConfig: runtimeLLMConfig,
    capabilities: runtimeCapabilities,
  } = {}) => {
    // 运行时传入的 capabilities 优先级高于初始化配置，
    // 便于上层在特定场景下临时裁剪或替换 capability 集合。
    const capabilities = (
      runtimeCapabilities ||
      configuredCapabilities ||
      []
    ).filter(Boolean);

    if (!capabilities.length) {
      throw new Error('当前未注册任何 Agent capability');
    }

    ensureUniqueToolNames(capabilities);

    // 根据当前问题和历史 session，在多个 capability 中选出最合适的一项。
    // 本文件不关心具体怎么选，只约束 selectCapability 的输入输出契约。
    const capability = selectCapability({
      question,
      sessionState,
      capabilities,
    });

    if (!capability) {
      throw new Error('未能为当前问题选择可用的 Agent capability');
    }

    // 每个 capability 自带自己的业务 tool，同时额外注入一个 clarify tool。
    // clarify tool 的职责是当槽位缺失、问题不完整时，主动让 agent 产出澄清问题，
    // 从而把“无法直接回答”的情况显式建模为 clarify 分支。
    const tools = [
      ...(capability.tools || []),
      buildAgentClarifyTool(capability),
    ];

    // LLM 配置同样遵循“运行时优先、初始化兜底”的规则。
    // 如果两者都无效，则把 undefined 交给 runFunctionCallingAgent，
    // 由更底层决定是否抛错或走默认实现。
    const resolvedLLMConfig = [runtimeLLMConfig, configuredAPI].find((item) =>
      isValidLLMConfig(item),
    );

    // 这里把“一个 capability”翻译成通用的 function-calling agent 执行参数。
    // runFunctionCallingAgent 只负责循环驱动：
    // - 拼 prompt
    // - 请求模型
    // - 执行 tool
    // - 根据结果进入 success / clarify / error
    // 而 capability 的差异，通过下面这些回调注入。
    const result = await runFunctionCallingAgent({
      question,
      sessionState,
      llmConfig: resolvedLLMConfig,
      systemPrompt: buildCapabilitySystemPrompt(capability),
      tools,
      maxLoops: capability.maxLoops || maxLoops,
      // 为当前 capability 构建初始 loopState。
      // loopState 是 agent 多轮执行过程中的“临时工作区”，
      // 用来保存槽位抽取结果、中间实体、工具调用产物等运行态信息。
      buildInitialLoopState: ({ sessionState: currentSessionState = {} }) =>
        buildCapabilityInitialLoopState({
          capability,
          sessionState: currentSessionState,
        }),
      // 每一轮都基于最新 loopState 重新组织 user prompt，
      // 让模型不仅看到原始问题，也能看到当前已经解析出的上下文和待补信息。
      buildUserPrompt: ({
        question: currentQuestion = '',
        sessionState: currentSessionState = {},
        loopState = {},
      }) =>
        buildCapabilityUserPrompt({
          capability,
          question: currentQuestion,
          sessionState: currentSessionState,
          loopState,
        }),
      // tool 执行统一走 capabilityRuntime，保证不同 capability 的 tool 调用协议一致。
      // step 会透传进去，便于底层记录第几轮/第几次工具执行。
      executeToolCall: ({
        toolCall,
        loopState = {},
        sessionState: currentSessionState = {},
        step = 1,
      }) =>
        executeCapabilityToolCall({
          capability,
          toolCall,
          loopState,
          sessionState: currentSessionState,
          step,
        }),
      // success 表示 agent 已经拿到了最终答案。
      // 这里除了返回 answer / steps 之外，还会把本轮抽取出的结构化信息、
      // 当前实体、历史问答记录等内容合并回 sessionState，
      // 供下一轮问题继续复用。
      onSuccess: ({
        answer = '',
        steps = [],
        loopState = {},
        question: currentQuestion = '',
        sessionState: currentSessionState = {},
      }) => {
        const { parsed, currentEntity, sessionPatch } =
          buildCapabilitySessionArtifacts({
            capability,
            loopState,
            activeCapability: capability.id,
          });

        // buildCapabilitySessionArtifacts 负责把运行期状态整理成可持久化的数据：
        // - parsed: 结构化解析结果
        // - currentEntity: 本轮聚焦的核心业务实体
        // - sessionPatch: capability 想写回 session 的补丁
        return {
          type: 'success',
          mode: 'function_calling',
          answer,
          steps,
          sessionState: buildNextSessionState({
            sessionState: currentSessionState,
            currentEntity,
            parsed,
            lastResult: {
              mode: 'function_calling',
              capabilityId: capability.id,
              currentEntity,
            },
            sessionPatch: {
              // sessionPatch 写 capability 自己关心的数据，
              // historyPatch 负责统一记录“这轮问了什么、答了什么、结果类型是什么”。
              ...sessionPatch,
              ...buildHistoryPatch({
                sessionState: currentSessionState,
                question: currentQuestion,
                answer,
                parsed,
                result: {
                  type: 'success',
                  answer,
                  mode: 'function_calling',
                },
              }),
            },
          }),
        };
      },
      // clarify 表示本轮没有直接产出最终答案，而是明确要求用户补充信息。
      // 这种状态与 error 不同：它是可恢复、可继续的正常流程节点。
      onClarify: ({
        toolExecution = {},
        steps = [],
        loopState = {},
        question: currentQuestion = '',
        sessionState: currentSessionState = {},
      }) => {
        const { parsed, sessionPatch } = buildCapabilitySessionArtifacts({
          capability,
          loopState,
          activeCapability: capability.id,
        });

        return {
          type: 'clarify',
          answer: toolExecution.answer,
          steps,
          sessionState: buildClarifyState({
            parsed,
            sessionState: currentSessionState,
            answer: toolExecution.answer,
            // missingSlots 会指导下一轮用户补充哪些关键信息，
            // 例如时间、对象、筛选条件等。
            missingSlots: toolExecution.missingSlots || [],
            capabilityId: capability.id,
            sessionPatch: {
              ...sessionPatch,
              ...buildHistoryPatch({
                sessionState: currentSessionState,
                question: currentQuestion,
                answer: toolExecution.answer,
                parsed,
                result: {
                  type: 'clarify',
                  answer: toolExecution.answer,
                },
              }),
            },
          }),
        };
      },
      // error 分支会尽量保留已解析出的上下文，并把失败结果写回 session，
      // 这样上层既能展示错误，也能在必要时基于已有上下文重试或转人工处理。
      onError: ({
        answer = '查询失败',
        steps = [],
        loopState = {},
        question: currentQuestion = '',
        sessionState: currentSessionState = {},
        reason = 'function_calling_error',
      }) => {
        const { parsed, currentEntity, sessionPatch } =
          buildCapabilitySessionArtifacts({
            capability,
            loopState,
            activeCapability: capability.id,
          });

        return {
          type: 'error',
          answer,
          steps,
          sessionState: buildNextSessionState({
            sessionState: currentSessionState,
            currentEntity,
            parsed,
            lastResult: {
              mode: reason,
              capabilityId: capability.id,
              currentEntity,
            },
            sessionPatch: {
              ...sessionPatch,
              ...buildHistoryPatch({
                sessionState: currentSessionState,
                question: currentQuestion,
                answer,
                parsed,
                result: {
                  type: 'error',
                  mode: reason,
                },
              }),
            },
          }),
        };
      },
    });

    // 再次兜底写入 activeCapability，避免底层某个分支遗漏该字段。
    return withActiveCapability(result, capability.id);
  };
};
