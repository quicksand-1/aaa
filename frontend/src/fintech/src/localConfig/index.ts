// @ts-nocheck

function FintechConfig() {}

const localConfig = {
  config: (params = {}) => {
    Object.entries(params).forEach(([key, value]) => {
      FintechConfig.prototype[key] = value;
    });
  },
  newInstance: () => {
    return new FintechConfig();
  },
};

export default localConfig;
