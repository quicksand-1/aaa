import { ArrowDownOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Button } from 'antd';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import useStyles from './style';
import useAutoScroll from './useAutoScroll';
import useBubbleItems from './useBubbleItems';

const MORE_KEY = '__xmessages_more__';

// 统一处理具名插槽：
// 1. 未传入时回退到内置节点
// 2. 传函数时把当前上下文透出给调用方，方便基于 items/loading 自定义渲染
// 3. 传 ReactNode 时直接使用
const renderSlot = (slot, fallbackNode, info) => {
  if (!slot) {
    return fallbackNode;
  }

  if (typeof slot === 'function') {
    return slot(info);
  }

  return slot;
};

const buildMoreItem = (more = {}) => {
  if (!more?.open) {
    return null;
  }

  const disabled = more?.disabled || more?.loading;

  return {
    key: MORE_KEY,
    role: 'system',
    content: more?.text ?? (more?.loading ? '加载中...' : '加载更多'),
    bubbleProps: {
      onClick: disabled ? undefined : more?.onClick,
      style: disabled
        ? { cursor: 'default', opacity: 0.65 }
        : { cursor: 'pointer' },
      ...more?.bubbleProps,
    },
    extraInfo: {
      type: 'more',
      disabled,
      ...(more?.extraInfo || {}),
    },
  };
};

/**
 * 标准消息项结构
 * @param {Object[]} items
 * @param {string|number} items[].key
 * @param {string} items[].role
 * @param {string} items[].type
 * @param {*} items[].content
 * @param {'loading'|'success'|'error'|'abort'} [items[].status]
 * @param {'start'|'end'} [items[].placement]
 * @param {React.ReactNode} [items[].avatar]
 * @param {boolean} [items[].typing]
 * @param {Object} [items[].extraInfo]
 * @param {Object} [items[].meta]
 * @param {Object} [items[].bubbleProps]
 * @param {Object} [markdownProps] 透传给文本消息所用 Xmarkdown 的属性，例如 dompurifyConfig、openLinksInNewTab
 * @param {Object} [more]
 * @param {boolean} [more.open]
 * @param {React.ReactNode} [more.text]
 * @param {boolean} [more.loading]
 * @param {boolean} [more.disabled]
 * @param {Function} [more.onClick]
 * @param {Object} [more.bubbleProps]
 */
export default function XMessages({
  actionRef,
  items = [],
  loading = false,
  renderers = {},
  slots = {},
  more = {},
  role = {},
  listProps = {},
  markdownProps,
}) {
  const { styles } = useStyles();
  const reactId = useId();
  const moreItem = buildMoreItem(more);
  const mergedItems = moreItem ? [moreItem, ...items] : items;
  const bubbleItems = useBubbleItems({
    items: mergedItems,
    renderers,
    role,
    markdownProps,
  });
  const { role: listRole, ...restListProps } = listProps;
  const listId = `xmessages-${reactId.replace(/:/g, '')}`;
  const { handleScroll, listRef, scrollToBottomVisible } = useAutoScroll({
    loading,
    ref: actionRef,
    items: mergedItems,
    enabled: restListProps.autoScroll !== false,
    onScroll: restListProps.onScroll,
  });
  const shouldRenderList =
    !(loading && items.length === 0) && mergedItems.length > 0;
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    if (!shouldRenderList || typeof document === 'undefined') {
      setPortalContainer(null);
      return;
    }

    setPortalContainer(document.getElementById(listId));
  }, [listId, shouldRenderList]);

  // XMessages 不是 Bubble.List 的透明转发层，因此没有直接把剩余参数用 ...props 全量透传。
  // 这样做是为了把“组件自己的业务 API”和“底层列表的原生配置”明确分开，避免命名冲突。
  // 其中最典型的冲突就是 role：顶层 role 是 XMessages 的专用能力，而 listProps.role 是底层 Bubble.List 的原生配置。
  // 两者在这里合并，且顶层 role 优先，避免调用方传了 listProps.role 后把组件自身的角色语义覆盖掉。
  const mergedRole = {
    ...(listRole || {}),
    ...role,
  };

  // 仅在“首次加载且没有任何消息”时显示整页 loading。
  // 如果已经有消息，再次 loading 更像是“继续生成/继续拉取”，这时应保留历史消息列表。
  if (loading && items.length === 0) {
    return renderSlot(slots.loading, <LoadingState />, { items, loading });
  }

  // 没有消息时展示空状态；如果调用方提供了 empty 插槽，则以调用方结果为准。
  if (mergedItems.length === 0) {
    return renderSlot(slots.empty, <EmptyState />, { items, loading });
  }

  return (
    <>
      <Bubble.List
        {...restListProps}
        id={listId}
        ref={listRef}
        style={{ ...restListProps.style, position: 'relative' }}
        items={bubbleItems}
        // role 用于给 Bubble.List 识别不同消息角色的视觉配置，例如头像、位置等。
        role={mergedRole}
        onScroll={handleScroll}
      />
      {portalContainer &&
        createPortal(
          <Button
            hidden={!scrollToBottomVisible}
            aria-label="滚动到底部"
            className={styles.scrollToBottom}
            icon={<ArrowDownOutlined />}
            shape="circle"
            onClick={() =>
              listRef.current?.scrollTo({
                top: 'bottom',
                behavior: 'smooth',
              })
            }
          />,
          portalContainer,
        )}
    </>
  );
}
