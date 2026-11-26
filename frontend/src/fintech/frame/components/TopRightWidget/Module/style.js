/**
 * antd-style: https://github.com/ant-design/antd-style
 * */

import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, cx, token }) => {
  const module = cx(css`
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0 8px;
    border-radius: 4px;
    height: 48px;

    &:hover {
      background-color: #f5f7fa;
    }
  `);

  const icon = cx(css`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ecf0f1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${token.colorPrimary};
    font-size: 16px;
  `);

  return {
    module,
    icon,
  };
});

export default useStyles;
