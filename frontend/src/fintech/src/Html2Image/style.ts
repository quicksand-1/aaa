/**
 * antd-style: https://github.com/ant-design/antd-style
 * */

import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, cx }) => {
  const action = cx(css`
    transition: 0.3s;
    position: absolute;
    top: -40px;
    right: 4px;
    z-index: 9;
    font-size: 14px;
    border-radius: 0 0 4px 4px;
    border: 1px solid #e4e9ec;
    border-top: none;
    padding: 4px;
    cursor: pointer;
    background-color: #fff;
  `);

  const content = cx(css`
    display: inline-block;
    width: 100%;
  `);

  return {
    container: css`
      position: relative;
      transition: 0.3s;
      overflow: hidden;
      border: 1px solid #fff;

      &:hover {
        padding: 12px;
        border: 1px solid #e4e9ec;

        .${action} {
          top: 0;
        }
      }
    `,
    action,
    content,
  };
});

export default useStyles;
