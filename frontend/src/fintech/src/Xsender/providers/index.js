import { createStorageSQLDraftProvider } from './createStorageSQLDraftProvider';
import { createStorageSQLHistoryProvider } from './createStorageSQLHistoryProvider';

// 推荐业务方优先从这个统一入口导入 provider 工具，
// 而不是深层引用具体文件。这样后续如果调整文件组织或补中间层逻辑，
// 对外导入路径可以保持稳定。
export { createStorageSQLDraftProvider, createStorageSQLHistoryProvider };

// 一次性创建成对的默认 provider。
// 适合“我就想要一套默认缓存方案”的场景，减少调用方样板代码。
// 同时保留 history / draft 分开传参，避免两个 provider 的配置项互相污染。
export const createStorageSQLProviders = (options = {}) => {
  const { history, draft } = options;

  return {
    historyProvider: createStorageSQLHistoryProvider(history),
    draftProvider: createStorageSQLDraftProvider(draft),
  };
};
