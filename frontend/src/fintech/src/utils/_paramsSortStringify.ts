export default (params = {}) => {
  // 排序 params 的键，以确保相同的参数生成相同的字符串
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return JSON.stringify(sortedParams);
};
