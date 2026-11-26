import { useCallback, useEffect, useRef, useState } from 'react';
import { isEmptyValue, normalizeValue } from '../value';

// 兜底 provider，保证组件在未注入历史实现时也能正常渲染。
// 这样 Xsender 可以先作为纯 UI 原型存在，后续再由业务层接入存储方案。
const emptyProvider = {
  load: async () => [],
  save: async () => {},
  clear: async () => {},
};

// 统一历史数据结构。
// 外部 provider 既可以返回字符串数组，也可以返回对象数组；这里全部转成
// { id, content } 的内部格式，减少上层组件的分支判断。
const normalizeHistoryItems = (items = []) => {
  return items
    .map((item, index) => {
      if (!item) {
        return null;
      }

      if (typeof item === 'string') {
        const normalizedValue = normalizeValue(item);

        return {
          id: `history-${index}`,
          value: normalizedValue,
        };
      }

      const normalizedValue = normalizeValue(
        item.value || item.content || item,
      );

      return {
        id: item.id || `history-${index}`,
        value: normalizedValue,
      };
    })
    .filter((item) => item && !isEmptyValue(item.value));
};

export default function useInputHistory({ enabled = true, historyProvider }) {
  const provider = historyProvider || emptyProvider;
  // 避免并发请求回写旧状态。
  // 这里不依赖 AbortController，而是用递增请求号屏蔽过期结果。
  const requestIdRef = useRef(0);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 某些内容不应该进入历史，例如建议项插入的固定 prompt。
  // 转成 Set 后，后续保存时可以 O(1) 判断。
  const loadHistory = useCallback(async () => {
    if (!enabled) {
      setHistoryItems([]);
      return;
    }

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    const items = await provider.load?.();
    const normalizedItems = normalizeHistoryItems(items);

    if (currentRequestId === requestIdRef.current) {
      setHistoryItems(normalizedItems);
    }
  }, [enabled, provider]);

  const saveHistory = useCallback(
    async (value) => {
      const nextValue = normalizeValue(value);

      // 空内容或未启用时都不入历史。
      if (!enabled || isEmptyValue(nextValue)) {
        return;
      }

      await provider.save?.({
        value: nextValue,
      });

      await loadHistory();
    },
    [enabled, loadHistory, provider],
  );

  const clearHistory = useCallback(async () => {
    if (!enabled) {
      setHistoryItems([]);
      setHistoryIndex(-1);
      return;
    }

    await provider.clear?.();
    setHistoryItems([]);
    setHistoryIndex(-1);
  }, [enabled, provider]);

  useEffect(() => {
    // 初次挂载时重置游标并读取历史。
    setHistoryIndex(-1);
    loadHistory();
  }, [loadHistory]);

  return {
    historyItems,
    historyIndex,
    setHistoryIndex,
    loadHistory,
    saveHistory,
    clearHistory,
  };
}
