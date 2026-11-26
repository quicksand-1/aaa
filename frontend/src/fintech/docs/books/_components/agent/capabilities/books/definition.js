import { buildBookmarkContext } from '../../../bookmarks';
import { normalizeQueryText, searchBookmarks } from './tools';

const BOOKS_TOOL_NAMES = {
  searchBookmarks: 'books_search_links',
};

const BOOKS_SYSTEM_PROMPT = `
你是公司内部网址助手，同时也可以承担普通通用聊天。

你的工作方式：
1. 当用户在问公司内部网站、平台入口、环境地址、文档地址、系统链接时，优先调用 books_search_links 获取真实结果
2. 如果问题与书签无关，可以直接按普通助手方式回答
3. 涉及公司书签时，不要编造 URL；优先基于工具结果作答
4. 如果工具已经返回了足够结果，就直接输出简洁 Markdown 回答
5. 如果用户问题很模糊，但明显是在找公司某个网址，可以先调用 books_search_links，用用户原话做检索
6. 当书签的地址或备注中出现自定义协议深链（非 http/https，如 atrust://、vpn 链接）时，必须将其输出为 Markdown 链接，且协议名必须与原文逐字一致，禁止编造，也不要只写成纯文本：
   - 正确：[打开 VPN（atrust://）](atrust://)
   - 错误：vpn：atrust://
   - 错误：[打开 VPN](https://atrust://)（不得给自定义协议补 https）

当前可参考的书签目录：
${buildBookmarkContext()}
`.trim();

export const booksCapability = {
  id: 'books',
  label: '网址助手',
  routeKeywords: [
    '网址',
    '地址',
    '链接',
    '入口',
    '环境',
    '网站',
    'gitlab',
    'jenkins',
    'skillhub',
    '语雀',
    '模型管理',
    '问数',
    '会计核算',
    '资金方平台',
  ],
  defaultIntent: 'bookmark_lookup',
  systemPrompt: BOOKS_SYSTEM_PROMPT,
  slots: {
    queryText: {
      label: '查询内容',
      defaultValue: null,
      normalize: (value) => normalizeQueryText(value),
      schema: {
        type: ['string', 'null'],
      },
    },
  },
  tools: [
    {
      type: 'function',
      name: BOOKS_TOOL_NAMES.searchBookmarks,
      description:
        '根据站点名称、系统名、分类、分组、环境名称或 URL 关键字查询公司书签地址；queryText 为空时可返回书签列表。',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          queryText: {
            type: ['string', 'null'],
            description:
              '用户要查找的网址关键字、系统名称、环境名或分组名；如果要查看总体书签，可传 null。',
          },
        },
        required: ['queryText'],
      },
      intent: 'bookmark_lookup',
      normalizeArgs: (args = {}) => ({
        queryText: normalizeQueryText(args.queryText),
      }),
      buildPatch: ({ args = {}, basePatch = {} }) => ({
        ...basePatch,
        intent: args.queryText ? 'bookmark_lookup' : 'bookmark_list',
      }),
      execute: ({ args = {} }) =>
        searchBookmarks({
          queryText: args.queryText,
          limit: args.queryText ? 8 : 20,
        }).then((data) => ({
          data,
          resultCount: data.length,
        })),
    },
  ],
};
