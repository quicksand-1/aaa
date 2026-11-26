module.exports = {
  extends: require.resolve('@umijs/lint/dist/config/eslint'),
  // 其他配置
  rules: {
    // 使用两个空格进行缩进
    indent: ['error', 2],
    // 禁止混用空格和制表符
    'no-mixed-spaces-and-tabs': 'error',
  },
};
