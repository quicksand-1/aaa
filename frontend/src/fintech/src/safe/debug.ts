export default () => {
  const checkSafe = () => {
    console.log('请关闭开发者工具！');
    // eslint-disable-next-line no-debugger
    debugger;
    requestAnimationFrame(checkSafe);
  };
  requestAnimationFrame(checkSafe);
};
