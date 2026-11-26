import isPlatform from './isPlatform';

export default ({ code, children }) => {
  return isPlatform(code) ? children : null;
};
