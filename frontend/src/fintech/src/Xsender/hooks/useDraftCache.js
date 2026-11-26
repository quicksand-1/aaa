import { useEffect, useRef } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { createEmptyValue, normalizeValue } from '../value';

// 草稿缓存同样采用可注入 provider。
// 这样业务层既可以接 storageSQL，也可以接 localStorage、服务端草稿或内存实现。
const emptyProvider = {
  load: async () => createEmptyValue(),
  save: async () => {},
  clear: async () => {},
};
const DRAFT_SAVE_DEBOUNCE_MS = 500;

export default function useDraftCache({
  enabled = true,
  draftProvider,
  value,
  setValue,
}) {
  const provider = draftProvider || emptyProvider;
  // load 草稿后会触发一次 setValue，如果不跳过，紧接着就会把同一份数据再写回 provider。
  // 这里用标记位消除这种“初始化写回”。
  const skipNextSaveRef = useRef(false);
  // 递增 token 用来屏蔽过期的防抖保存，避免 clear / reload 之后旧定时器反写草稿。
  const saveRequestIdRef = useRef(0);
  const saveDraft = useDebounce(
    (content, requestId) => {
      if (requestId !== saveRequestIdRef.current) {
        return;
      }

      provider.save?.({
        value: normalizeValue(content),
      });
    },
    DRAFT_SAVE_DEBOUNCE_MS,
    [provider],
  );

  useEffect(() => {
    let active = true;

    if (!enabled) {
      return () => {
        active = false;
      };
    }

    // 阻止 effect 2 在首次渲染时保存初始值，等异步加载完成后再由 .then() 中的标记控制。
    skipNextSaveRef.current = true;
    // 重新加载草稿前先让已有的待保存任务失效，避免旧内容回写。
    saveRequestIdRef.current += 1;

    Promise.resolve(provider.load?.()).then((draft) => {
      if (!active) {
        return;
      }

      // setValue 会触发 effect 2 重新执行，若不重新设置 skip 标记，刚加载的草稿会立即被保存回去。
      skipNextSaveRef.current = true;
      setValue(normalizeValue(draft), {
        reason: 'draftLoad',
      });
    });

    return () => {
      active = false;
    };
  }, [enabled, provider, setValue]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // 跳过初始化阶段的一次自动保存，避免无意义写入。
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    // 输入值变化后保存到全局草稿。
    // 用防抖减少频繁持久化，同时保持输入框本身仍然实时更新。
    saveRequestIdRef.current += 1;
    saveDraft(normalizeValue(value), saveRequestIdRef.current);
  }, [enabled, saveDraft, value]);

  const clearDraft = async () => {
    // 清理草稿只负责持久层，输入框值由调用方决定是否一起清空。
    if (!enabled) {
      return;
    }

    // 先让已有的待保存任务失效，再清持久层，避免草稿被旧定时器恢复。
    saveRequestIdRef.current += 1;
    await provider.clear?.();
  };

  return {
    clearDraft,
  };
}
