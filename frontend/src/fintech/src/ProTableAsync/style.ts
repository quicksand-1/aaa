/**
 * antd-style: https://github.com/ant-design/antd-style
 * */

import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  blink: css`
    color: ${token.colorWarning};
    font-weight: 500;
    animation: blink 1.5s linear infinite;

    @keyframes blink {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
  `,
}));

export default useStyles;
