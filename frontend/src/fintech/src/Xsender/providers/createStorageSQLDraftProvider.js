import { storageSQL } from 'fintech';
import { computeSerializedText, normalizeValue } from '../value';

// 默认草稿缓存 provider。
// 它的设计目标和历史 provider 一样：为项目提供默认实现，但不限制用户覆盖。
export const createStorageSQLDraftProvider = (options = {}) => {
  // 默认实现只保留 1 条全局草稿，所以这里只需要表前缀，不需要 maxCount 之类的参数。
  const { tablePrefix = 'xsender_draft' } = options;

  return {
    load: async () => {
      // 草稿表里约定只保留 id=draft 这一条记录。
      // 这样读取逻辑最稳定，不依赖 createTime 排序，也不担心存在多条候选记录。
      const draft = storageSQL('find', {
        from: tablePrefix,
        where: 'id=draft',
        defaultObject: {
          content: '',
          payload: '',
        },
      });

      if (draft.payload) {
        try {
          return normalizeValue(JSON.parse(draft.payload));
        } catch (error) {
          return normalizeValue(draft.content || '');
        }
      }

      return normalizeValue(draft.content || '');
    },
    save: async ({ value }) => {
      const normalizedValue = normalizeValue(value);

      // 用 duplicate 而不是 insert：
      // - 已存在 id=draft 时更新
      // - 不存在时自动插入
      // 这样全局草稿永远是一条稳定记录，不会越存越多。
      storageSQL('duplicate', {
        from: tablePrefix,
        where: 'id=draft',
        values: {
          id: 'draft',
          content: computeSerializedText(normalizedValue.segments) || '',
          payload: JSON.stringify(normalizedValue),
        },
      });
    },
    clear: async () => {
      // 草稿是单条全局记录，清理时删记录即可。
      storageSQL('delete', {
        from: tablePrefix,
        where: 'id=draft',
      });
    },
  };
};
