import { useEffect, useState } from 'react';
import localConfig from '../localConfig';

const useAsyncScripts = (scripts: string[]) => {
  const { publicPath = '/' } = localConfig.newInstance();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScript = async (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const isJS = url.split('.').pop() === 'js';

        // 检查是否已存在相同的 script 标签
        const existingScript = Array.from(
          document.getElementsByTagName(isJS ? 'script' : 'link'),
        ).find((s) => s[isJS ? 'src' : 'href'] === url);

        // 脚本已加载
        if (existingScript) {
          resolve();
          return;
        }

        // 动态插入标签
        const scriptElement = document.createElement(isJS ? 'script' : 'link');
        scriptElement[isJS ? 'type' : 'rel'] = isJS
          ? 'text/javascript'
          : 'stylesheet';
        scriptElement[isJS ? 'src' : 'href'] = url;
        document[isJS ? 'body' : 'head'].appendChild(scriptElement);

        scriptElement.onload = () => {
          resolve();
        };

        scriptElement.onerror = () => {
          alert(`资源加载错误: ${url}`);
          reject(new Error(`资源加载错误: ${url}`));
        };
      });
    };

    const loadAllScriptsSequentially = async () => {
      try {
        for (const script of scripts) {
          await loadScript(`${publicPath}${script}`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllScriptsSequentially();
  }, []);

  return [loading, error];
};

export default useAsyncScripts;
