/**
 * antd-style: https://github.com/ant-design/antd-style
 * */

import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, cx, token }) => {
  const container = cx(css`
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f7ff, #e3eeff);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `);

  const main = cx(css`
    display: flex;
    width: 100%;
    max-width: 1000px;
    min-height: 600px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
    position: relative;
  `);

  const platformDropdown = cx(css`
    position: absolute;
    top: 10px;
    right: 10px;
  `);

  /**
   * 左侧信息内容
   * */
  const brand = cx(css`
    flex: 1;
    padding: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: ${token.colorPrimary};
    color: #fff;
  `);

  // logo 和 标题
  const brandHeader = cx(css`
    display: flex;
    gap: 15px;
    align-items: center;
    padding-bottom: 30px;
  `);

  const brandLogo = cx(css`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    border: none;
    padding: 6px;
    background: rgba(255, 255, 255, 0.15);
  `);

  const brandName = cx(css`
    font-size: 2.2rem;
    font-weight: 700;
  `);

  const brandContent = cx(css`
    font-size: 1.4rem;
    font-weight: 600;
  `);

  const login = cx(css`
    flex: 1;
    padding: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `);

  const loginHeader = cx(css`
    font-size: 2rem;
    color: #202124;
    margin-bottom: 40px;
    font-weight: 700;
  `);

  return {
    container,
    main,
    platformDropdown,
    brand,
    brandHeader,
    brandLogo,
    brandName,
    brandContent,
    login,
    loginHeader,
  };
});

export default useStyles;
