/**
 * antd-style: https://github.com/ant-design/antd-style
 * */

import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css }) => ({
  magicTabs: css`
    background-color: #fff;
  `,
  noTabBarBottom: css`
    .ant-tabs-nav {
      margin-bottom: 0 !important;
    }
  `,
  padding: css`
    padding: 24px !important;
  `,
}));

export default useStyles;
