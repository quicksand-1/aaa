import { DEFAULT_AGENT_MEMORY_STATE } from './historyManager';

export const DEFAULT_AGENT_SESSION_STATE = {
  activeCapability: null,
  currentEntity: null,
  lastParsed: null,
  lastResult: null,
  pendingClarify: null,
  capabilities: {},
  toolCache: {},
  memory: DEFAULT_AGENT_MEMORY_STATE,
};

export const mergeSessionPatch = (...patches) =>
  patches.filter(Boolean).reduce(
    (acc, patch) => ({
      ...acc,
      ...patch,
      toolCache: {
        ...(acc.toolCache || {}),
        ...(patch.toolCache || {}),
      },
      capabilities: {
        ...(acc.capabilities || {}),
        ...(patch.capabilities || {}),
      },
      memory: {
        ...(acc.memory || DEFAULT_AGENT_MEMORY_STATE),
        ...(patch.memory || {}),
      },
    }),
    {},
  );

export const buildNextSessionState = ({
  sessionState = {},
  currentEntity = null,
  parsed = null,
  pendingClarify = null,
  lastResult = null,
  sessionPatch = {},
}) => {
  const mergedPatch = mergeSessionPatch(sessionPatch);
  const hasPatchedEntity = Object.prototype.hasOwnProperty.call(
    mergedPatch,
    'currentEntity',
  );

  return {
    ...DEFAULT_AGENT_SESSION_STATE,
    ...sessionState,
    ...mergedPatch,
    currentEntity: hasPatchedEntity
      ? mergedPatch.currentEntity
      : currentEntity || sessionState.currentEntity || null,
    lastParsed: parsed || sessionState.lastParsed || null,
    lastResult: lastResult || null,
    pendingClarify: pendingClarify || null,
  };
};

export const buildClarifyState = ({
  parsed = {},
  sessionState = {},
  answer = '',
  missingSlots = [],
  capabilityId = null,
  sessionPatch = {},
}) =>
  buildNextSessionState({
    sessionState,
    parsed,
    sessionPatch,
    pendingClarify: {
      question: answer,
      capabilityId,
      intent: parsed.intent,
      slots: parsed.slots,
      missingSlots,
    },
  });
