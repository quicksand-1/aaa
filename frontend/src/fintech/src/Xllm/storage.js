import storageSQL from '../utils/storageSQL';

const LLM_CONFIG_LIST_FROM = 'llm_configs';

export const getLLMConfigList = () =>
  (
    storageSQL('select', {
      from: LLM_CONFIG_LIST_FROM,
    }) || []
  ).map((item) => ({
    ...item,
    endpointType: 'responses',
  }));

export const enableLLMConfig = (id = '') => {
  storageSQL('update', {
    from: LLM_CONFIG_LIST_FROM,
    where: '',
    values: {
      enabled: false,
    },
  });

  storageSQL('update', {
    from: LLM_CONFIG_LIST_FROM,
    where: `id=${id}`,
    values: {
      enabled: true,
    },
  });
};

export const getLLMConfig = () => ({
  ...(storageSQL('find', {
    from: LLM_CONFIG_LIST_FROM,
    where: 'enabled=true',
    defaultObject: {},
  }) || {}),
  endpointType: 'responses',
});

export const saveLLMConfig = (values = {}) => {
  storageSQL('duplicate', {
    from: LLM_CONFIG_LIST_FROM,
    where: `id=${values.id}`,
    values: {
      ...values,
      endpointType: 'responses',
    },
  });
};

export const deleteLLMConfig = (id = '') => {
  storageSQL('delete', {
    from: LLM_CONFIG_LIST_FROM,
    where: `id=${id}`,
  });
};
