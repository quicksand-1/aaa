import { storageSQL } from 'fintech';
import { computeSerializedText, isEmptyValue, normalizeValue } from '../value';

// storageSQL 插入数据时会自动补 createTime、id 等字段。
// Xsender 内部当前只关心历史导航，所以在这里做一次格式收口：
// - 只保留输入组件真正需要的 id / content
// - 过滤掉空内容，避免异常数据影响历史导航
const normalizeHistoryItems = (items = []) => {
  return items
    .map((item) => {
      const normalizedValue = item.payload
        ? (() => {
            try {
              return normalizeValue(JSON.parse(item.payload));
            } catch (error) {
              return normalizeValue(item.content || '');
            }
          })()
        : normalizeValue(item.content || '');

      return {
        id: item.id,
        value: normalizedValue,
      };
    })
    .filter((item) => !isEmptyValue(item.value));
};

// 默认历史缓存 provider。
// 目标不是替代 Xsender 的扩展口，而是给当前项目提供一套“开箱即用”的实现：
// - 用户不需要重复编写 storageSQL 读写逻辑
// - 依然可以通过自定义 provider 完全覆盖这套默认行为
export const createStorageSQLHistoryProvider = (options = {}) => {
  const {
    // 历史和草稿仍建议使用不同表名，避免表职责混淆。
    tablePrefix = 'xsender_history',
    // 只保留最近 N 条输入历史，避免 localStorage 无限制增长。
    maxCount = 20,
    // 同一条内容再次发送时，是否把旧记录删掉再插入新记录。
    // 开启后，历史列表更像“最近使用记录”；关闭后则更像“完整发送流水”。
    dedupe = true,
  } = options;

  return {
    load: async () => {
      // 历史读取固定按 createTime 倒序，让最新一条排在最前面。
      // 这与 Xsender 中 ArrowUp 先拿最近历史的交互规则保持一致。
      const rows =
        storageSQL('select', {
          from: tablePrefix,
          orderBy: 'createTime',
          sort: 'DESC',
        }) || [];

      return normalizeHistoryItems(rows);
    },
    save: async ({ value }) => {
      const normalizedValue = normalizeValue(value);
      const nextContent = computeSerializedText(
        normalizedValue.segments,
      ).trim();

      // 历史记录只保存有效内容，不保留纯空白输入。
      if (!nextContent) {
        return;
      }

      // 全局历史不再按会话隔离，所有输入共用一张表。
      // 先读取当前历史，后续用于去重和裁剪。
      const currentRows =
        storageSQL('select', {
          from: tablePrefix,
          orderBy: 'createTime',
          sort: 'DESC',
        }) || [];

      if (dedupe) {
        // 去重策略不是 update，而是“删旧插新”：
        // 目的是刷新 createTime，让这条内容重新回到最近使用的位置。
        currentRows
          .filter((item) => item.content === nextContent)
          .forEach((item) => {
            storageSQL('delete', {
              from: tablePrefix,
              where: `id=${item.id}`,
            });
          });
      }

      // 插入后由 storageSQL 自动补 createTime 和 id。
      storageSQL('insert', {
        from: tablePrefix,
        values: {
          content: nextContent,
          payload: JSON.stringify(normalizedValue),
        },
      });

      if (maxCount > 0) {
        // 插入完成后再做裁剪，保证“当前这次新输入”一定会被保留下来。
        const latestRows =
          storageSQL('select', {
            from: tablePrefix,
            orderBy: 'createTime',
            sort: 'DESC',
          }) || [];

        // 因为前面已经按倒序排好了，所以 slice(maxCount) 拿到的就是超出上限的旧数据。
        latestRows.slice(maxCount).forEach((item) => {
          storageSQL('delete', {
            from: tablePrefix,
            where: `id=${item.id}`,
          });
        });
      }
    },
    clear: async () => {
      // 全局历史清理直接删整张表。
      storageSQL('drop', {
        from: tablePrefix,
      });
    },
  };
};
