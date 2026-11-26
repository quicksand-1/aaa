/**
 * 页脚内容：版权信息、版本信息
 *   版本信息：读取 package.json 中的版本信息，在进行迭代升级时，请注意版本升级
 * VERSION、BUILD_TIME：读取框架中 .umirc.ts 的 define 配置
 * */

const Copyright = ({ show = false, text, ...props }) => {
  return (
    <div
      id="copyright"
      hidden={!show}
      style={{
        textAlign: 'center',
        padding: '0 6px 6px 6px',
        color: 'rgb(132, 145, 165)',
        ...props.style,
      }}
    >
      {text ||
        `©${new Date().getFullYear()} 资质工作台 · @${VERSION} · ${BUILD_TIME}`}
    </div>
  );
};

export default Copyright;
