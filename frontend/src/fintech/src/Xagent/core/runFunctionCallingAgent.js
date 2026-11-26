import { getLLMConfig } from '../../Xllm/storage';
import {
  appendFunctionCallOutputs,
  requestFunctionCallingTurn,
} from './functionCallingClient';
import { createStep } from './stepLogger';

const isValidLLMConfig = (config = {}) =>
  Boolean(config?.baseUrl && config?.apiKey && config?.model);

const resolveLLMConfig = (...candidates) => {
  const validConfig = candidates.find((item) => isValidLLMConfig(item));

  if (validConfig) {
    return validConfig;
  }

  return candidates.find(Boolean) || {};
};

export const runFunctionCallingAgent = async ({
  question = '',
  sessionState = {},
  llmConfig,
  systemPrompt = '',
  tools = [],
  maxLoops = 6,
  buildInitialLoopState = () => ({}),
  buildUserPrompt = ({ question: currentQuestion = '' }) => currentQuestion,
  executeToolCall,
  onSuccess,
  onClarify,
  onError,
}) => {
  const resolvedLLMConfig = resolveLLMConfig(llmConfig, getLLMConfig());

  if (!isValidLLMConfig(resolvedLLMConfig)) {
    throw new Error('请先配置 LLM 的 Base URL、API Key 和 Model');
  }

  if (typeof executeToolCall !== 'function') {
    throw new Error('runFunctionCallingAgent 缺少 executeToolCall 实现');
  }

  if (typeof onSuccess !== 'function') {
    throw new Error('runFunctionCallingAgent 缺少 onSuccess 实现');
  }

  if (typeof onClarify !== 'function') {
    throw new Error('runFunctionCallingAgent 缺少 onClarify 实现');
  }

  if (typeof onError !== 'function') {
    throw new Error('runFunctionCallingAgent 缺少 onError 实现');
  }

  const steps = [];
  let stepNumber = 1;
  let loopState = buildInitialLoopState({
    question,
    sessionState,
  });
  let llmTurn = await requestFunctionCallingTurn({
    config: resolvedLLMConfig,
    systemPrompt,
    userPrompt: buildUserPrompt({
      question,
      sessionState,
      loopState,
    }),
    tools,
  });

  for (let index = 0; index < maxLoops; index += 1) {
    steps.push(
      createStep(stepNumber, 'agent_decision', {
        loop: index + 1,
        text: llmTurn.text || '',
        toolCalls: llmTurn.toolCalls.map((item) => ({
          name: item.name,
          arguments: item.arguments,
        })),
      }),
    );
    stepNumber += 1;

    if (!llmTurn.toolCalls.length) {
      return onSuccess({
        answer: llmTurn.text?.trim() || '已完成查询。',
        steps,
        loopState,
        question,
        sessionState,
      });
    }

    const toolOutputs = [];

    for (const toolCall of llmTurn.toolCalls) {
      try {
        const toolExecution = await executeToolCall({
          toolCall,
          loopState,
          question,
          sessionState,
          step: stepNumber,
        });

        if (toolExecution.step) {
          steps.push(toolExecution.step);
          stepNumber += 1;
        }

        if (toolExecution.loopStatePatch) {
          loopState = {
            ...loopState,
            ...toolExecution.loopStatePatch,
          };
        }

        if (toolExecution.type === 'clarify') {
          return onClarify({
            toolExecution,
            steps,
            loopState,
            question,
            sessionState,
          });
        }

        if (toolExecution.type === 'error') {
          return onError({
            answer: toolExecution.answer || '工具调用失败',
            reason: 'tool_execution_error',
            steps,
            loopState,
            question,
            sessionState,
            toolExecution,
          });
        }

        // 这里要把 toolCall.callId 原样带回去，而不是重新生成一个 ID。
        //
        // 原因是：toolCall.callId 来自模型这一次返回的 function_call，
        // appendFunctionCallOutputs 会把它写成 function_call_output.call_id 再发回模型。
        // 模型依靠这个 ID 来匹配：
        // - “我刚才发起的那次工具调用”
        // - “现在收到的这份工具执行结果”
        //
        // 这个字段的职责不是业务标识，而是协议层的关联标识。
        // 一旦丢失或替换，模型就可能把结果和错误的调用对应起来，
        // 尤其是在一轮存在多个 tool call 时，会直接破坏后续推理。
        toolOutputs.push({
          callId: toolCall.callId,
          name: toolCall.name,
          output: toolExecution.output,
        });
      } catch (error) {
        steps.push(
          createStep(stepNumber, 'call_tool', {
            tool: toolCall.name,
            input: toolCall.arguments,
            error: error.message || 'tool execution failed',
          }),
        );
        stepNumber += 1;

        // 即使工具执行抛错，也仍然要带着原始 callId 把错误结果回传给模型。
        // 这样模型才知道“这次调用已经有结果了，只是结果是失败”，
        // 而不是误判为调用还未完成，从而继续等待或重复规划。
        toolOutputs.push({
          callId: toolCall.callId,
          name: toolCall.name,
          output: {
            ok: false,
            tool: toolCall.name,
            input: toolCall.arguments || {},
            error: error.message || '工具调用失败',
          },
        });
      }
    }

    llmTurn = await appendFunctionCallOutputs({
      config: resolvedLLMConfig,
      state: llmTurn.state,
      toolOutputs,
    });
  }

  return onError({
    answer: '查询流程超过最大推理轮次，请换一种问法或补充更明确的条件。',
    reason: 'max_loops_exceeded',
    steps,
    loopState,
    question,
    sessionState,
  });
};
