// 计算字符串在页面中的宽度
const calculateCharacterLength = (column = {}) => {
  // @ts-ignore
  const { title, title2 } = column;
  const str = title2 || title;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '16px Arial';
  return context.measureText(str).width;
};

export default calculateCharacterLength;
