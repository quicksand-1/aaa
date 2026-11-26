export const createStep = (step = 1, stage = '', payload = {}) => ({
  step,
  stage,
  ...payload,
});
