const normalizeText = (value = '') => String(value || '').toLowerCase();

const hasFollowUpSignal = (question = '') => {
  const text = String(question || '').trim();

  if (!text) {
    return false;
  }

  return /(它|这个|该|继续|然后|再查|再看|补充|还有|那|其)/.test(text);
};

const scoreCapability = ({ capability = {}, question = '' }) => {
  const text = normalizeText(question);
  const keywords = Array.isArray(capability.routeKeywords)
    ? capability.routeKeywords
    : [];

  return keywords.reduce((score, keyword) => {
    if (!keyword) {
      return score;
    }

    return text.includes(normalizeText(keyword)) ? score + 1 : score;
  }, 0);
};

export const selectAgentCapability = ({
  question = '',
  sessionState = {},
  capabilities = [],
}) => {
  if (!capabilities.length) {
    return null;
  }

  if (capabilities.length === 1) {
    return capabilities[0];
  }

  const stickyCapabilityId =
    sessionState?.pendingClarify?.capabilityId ||
    sessionState?.activeCapability;

  if (stickyCapabilityId && hasFollowUpSignal(question)) {
    const stickyCapability = capabilities.find(
      (item) => item.id === stickyCapabilityId,
    );

    if (stickyCapability) {
      return stickyCapability;
    }
  }

  const rankedCapabilities = capabilities
    .map((capability) => ({
      capability,
      score: scoreCapability({
        capability,
        question,
      }),
    }))
    .sort((left, right) => right.score - left.score);

  if (rankedCapabilities[0]?.score > 0) {
    return rankedCapabilities[0].capability;
  }

  return (
    capabilities.find((item) => item.id === stickyCapabilityId) ||
    capabilities[0]
  );
};
