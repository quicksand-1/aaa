/**
 * 从命令行中获取指定参数
 * @plf：指定打包的平台，格式 plf=tj
 * @base：指定编译基础路由，格式 base=firpt
 * */

export default (command = []) => {
  // 当前执行的平台配置项，默认为第一个
  let platformKey;
  // let base;
  // let publicPath;

  // 循环命令行参数
  command.forEach((i) => {
    const v = i.split('=')[1];
    // 判断当前命令行中是否有平台可执行的参数，用例：plf=tj
    if (i.includes('plf')) {
      platformKey = v;
    }

    /**
     * 线上部署（二级目录）：需要修改 BASE、PUBLIC_PATH
     *   BASE: /firpt
     *   PUBLIC_PATH: /firpt/
     * */
    // if (i.includes('base')) {
    //   base = `/${v}`;
    //   publicPath = `${base}/`;
    // }
  });

  return { platformKey };
};
