import React, { useMemo } from 'react';
import getMessageKey from './getMessageKey';
import MessageContent from './MessageContent';

const DEFAULT_ROLE_CONFIG = {
  ai: {
    placement: 'start',
  },
  assistant: {
    placement: 'start',
  },
  user: {
    placement: 'end',
  },
  system: {
    placement: 'start',
  },
  divider: {
    placement: 'start',
  },
};

const resolveRoleConfig = (roleConfig, data) => {
  if (typeof roleConfig === 'function') {
    return roleConfig(data) || {};
  }

  return roleConfig || {};
};

export default function useBubbleItems({
  items = [],
  renderers,
  role = {},
  markdownProps,
}) {
  return useMemo(
    () =>
      items.map((item, index) => {
        // 保证每条消息都有稳定 key：
        // 优先使用业务主键，没有时退化到顺序 key，供 Bubble.List 渲染和滚动定位复用。
        const key = getMessageKey(item, index);
        const itemRole = item?.role;
        const bubbleProps = item?.bubbleProps || {};
        // 把原始消息注入 extraInfo.item，供 Bubble 的 header/footer/avatar 等插槽
        // 通过官方签名里的 info.extraInfo 读取业务字段，例如时间戳、消息扩展信息等。
        const mergedExtraInfo = {
          ...(bubbleProps?.extraInfo || {}),
          ...(item?.extraInfo || {}),
          item,
        };
        const roleData = {
          key,
          role: itemRole,
          status: item?.status,
          content: item?.content,
          extraInfo: mergedExtraInfo,
        };
        // role[itemRole] 同时支持对象和函数，与 Bubble.List 官方能力保持一致。
        // 角色配置分两层：
        // 1. 组件内置默认值，提供基础左右布局
        // 2. 调用方通过 role[itemRole] 注入覆盖项，例如头像、额外样式配置
        const mergedRoleConfig = {
          ...(DEFAULT_ROLE_CONFIG[itemRole] || {}),
          ...resolveRoleConfig(role[itemRole], roleData),
        };

        return {
          key,
          role: itemRole,
          status: item?.status,
          // 先铺开角色级默认配置，再铺开单条消息 bubbleProps，
          // 让调用方既可以按角色批量定制，也可以按消息单独覆盖。
          ...mergedRoleConfig,
          ...bubbleProps,
          // placement/typing/avatar 单独显式处理，是为了把优先级写死：
          // item 字段 > bubbleProps > role 默认值。
          // 这样单条消息永远可以覆盖掉通用配置。
          placement:
            item?.placement ??
            bubbleProps?.placement ??
            mergedRoleConfig?.placement,
          typing:
            item?.typing ?? bubbleProps?.typing ?? item?.status === 'loading',
          avatar:
            item?.avatar ?? bubbleProps?.avatar ?? mergedRoleConfig?.avatar,
          extraInfo: mergedExtraInfo,
          // content 在这里统一包装成 MessageContent，
          // 把“如何渲染消息内容”的策略从列表结构适配中拆出去。
          content: (
            <MessageContent
              item={item}
              renderers={renderers}
              markdownProps={markdownProps}
            />
          ),
        };
      }),
    [items, renderers, role, markdownProps],
  );
}
