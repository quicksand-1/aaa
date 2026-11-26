import { getLLMConfig } from '../Xllm/storage';
import useKeyboard from '../hooks/useKeyboard';

const validateConfig = (config: Record<string, any> = {}): boolean => {
  return !!(config.model && config.baseUrl && config.apiKey);
};

const initPageAgent = (): boolean => {
  const config = getLLMConfig();

  if (!validateConfig(config)) {
    alert('请先在 LLM 配置中启用一条可用配置');
    return false;
  }

  try {
    const { PageAgent } = require('page-agent');
    (window as any).agent = new PageAgent({
      model: config.model,
      baseURL: config.baseUrl,
      apiKey: config.apiKey,
      language: navigator.language || 'zh-CN',
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize PageAgent:', error);
    alert('初始化 PageAgent 失败，请检查 LLM 配置和依赖');
    return false;
  }
};

const handleAgentToggle = (): void => {
  try {
    (window as any).agent.panel.show();
  } catch (error) {
    if (!initPageAgent()) {
      return;
    }

    setTimeout(() => {
      (window as any).agent?.panel?.show?.();
    }, 100);
  }
};

/**
 * PageAgent Hook
 * 用于监听快捷键并处理 Agent 的初始化和显示
 * @param options - 配置选项
 * @param options.position - 快捷键位置，默认为空字符串（不触发快捷键）
 */
const usePageAgent = (options?: { position?: string }) => {
  useKeyboard({
    position: options?.position || 'A',
    callback: (open) => {
      if (open) {
        handleAgentToggle();
      } else {
        (window as any).agent?.panel?.hide?.();
      }
    },
  });
};

export default usePageAgent;
