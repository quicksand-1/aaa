import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, cx, token }) => ({
  state: cx(css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: ${token.colorTextSecondary};
  `),
  scrollToBottom: cx(css`
    position: absolute;
    bottom: 16px;
    left: 50%;
    z-index: 1;
    padding: 0;
    aspect-ratio: 1;
    flex: none;
    color: ${token.colorTextSecondary};
    background: ${token.colorBgElevated};
    border-color: ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowSecondary};
    transform: translateX(-50%);

    &[hidden] {
      display: none !important;
    }

    &:hover,
    &:focus-visible {
      color: ${token.colorPrimary} !important;
      background: ${token.colorBgElevated} !important;
      border-color: ${token.colorPrimary} !important;
    }
  `),
}));

export default useStyles;
