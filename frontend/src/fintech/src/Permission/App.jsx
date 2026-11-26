import isApp from './isApp';

export default ({ code, children }) => {
  return isApp(code) ? children : null;
};
