/**
 * 自动检测更新函数
 * 测试方式（模拟上线环境）：本地安装 nginx 后进行代理 dist 目录，修改代码后进行 build
 * */

const autoUpdate = (duration = 20000, publicPath = '/') => {
  const scripts: string[] = []; // 存储 /umi.225b0a99.js 这样的信息

  // 获取页面的 script 内容
  const getNewScripts = async () => {
    const html = await fetch(`${publicPath}?_timestamp=${Date.now()}`).then(
      (res) => res.text(),
    );
    const regex = /<script src="(\/umi\.[a-zA-Z0-9]+\.js)"><\/script>/;
    const match = html.match(regex);

    if (match) {
      return match[1];
    }

    return '';
  };

  // 定时更新
  const autoRefresh = async () => {
    // 获取远端标识
    const newScripts = await getNewScripts();

    if (!newScripts) return;

    // 如果本地还没有缓存，则表示是第一次，则不进行更新
    if (scripts.length === 0) {
      scripts.push(newScripts);
      return;
    }

    // 如果新的标识不在缓存中，则需要进行更新提醒
    if (!scripts.includes(newScripts)) {
      scripts.push(newScripts);
      const result = confirm('有更新内容，点击确定刷新页面。');

      if (result) {
        location.reload();
      }
    }
  };

  autoRefresh();
  setInterval(() => {
    autoRefresh();
  }, duration);
};

export default autoUpdate;
