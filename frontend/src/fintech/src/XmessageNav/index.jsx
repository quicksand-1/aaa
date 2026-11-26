import { Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { useCallback, useEffect, useState } from 'react';
import Xmarkdown from '../Xmarkdown';

const DEFAULT_MIN_VISIBLE = 4;

function scaleFor(index, hoveredIndex) {
  if (hoveredIndex === null) return 0.23;

  const distance = Math.abs(index - hoveredIndex);
  if (distance === 0) return 1;
  if (distance === 1) return 0.7;
  if (distance === 2) return 0.4;
  return 0.2;
}

function DefaultPreview({ content }) {
  return <Xmarkdown content={content || ''} />;
}

const useStyles = createStyles(({ css, token }) => ({
  rail: css`
    display: flex;
    flex-direction: column;
    gap: 1px;
    max-height: min(70vh, 40rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-block: 4px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  `,
  item: css`
    display: flex;
    flex: none;
    width: 36px;
    height: 10px;
    align-items: center;
    padding: 0;
    cursor: pointer;
    border: 0;
    border-radius: ${token.borderRadius}px;
    outline: none;
    background: transparent;

    &:focus-visible {
      background: ${token.colorFillTertiary};
    }
  `,
  track: css`
    display: flex;
    width: 26px;
    height: 2px;
    align-items: center;
  `,
  mark: css`
    display: block;
    width: 100%;
    height: 100%;
    transform-origin: left;
    border-radius: 999px;
    background: ${token.colorTextDisabled};
    transition: transform 150ms linear;

    &[data-active='true'],
    &[data-hovered='true'] {
      background: ${token.colorText};
    }
  `,
  preview: css`
    color: ${token.colorTextLightSolid};

    &,
    & * {
      color: ${token.colorTextLightSolid} !important;
    }
  `,
}));

export default function XmessageNav({
  activeKey: activeKeyProp,
  defaultActiveKey,
  items = [],
  minVisible = DEFAULT_MIN_VISIBLE,
  followLast = true,
  preview = DefaultPreview,
  onActiveChange,
  onNavigate,
  className,
  style,
}) {
  const { styles } = useStyles();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [innerActiveKey, setInnerActiveKey] = useState(
    defaultActiveKey ?? items[items.length - 1]?.key,
  );

  const controlled = activeKeyProp !== undefined;
  const activeKey = controlled ? activeKeyProp : innerActiveKey;

  useEffect(() => {
    if (controlled || !followLast) return;

    const latestKey = items[items.length - 1]?.key;
    if (latestKey !== undefined) {
      setInnerActiveKey(latestKey);
    }
  }, [controlled, followLast, items]);

  const changeActiveKey = useCallback(
    (key) => {
      if (!controlled) {
        setInnerActiveKey(key);
      }

      onActiveChange?.(key);
    },
    [controlled, onActiveChange],
  );

  if (items.length < minVisible) return null;

  return (
    <div
      className={[styles.rail, className].filter(Boolean).join(' ')}
      style={style}
    >
      {items.map((item, index) => {
        const scale = scaleFor(index, hoveredIndex);
        const isCurrent = item.key === activeKey;
        const isHovered = index === hoveredIndex;
        const previewNode =
          typeof preview === 'function'
            ? preview({
                item,
                index,
                active: isCurrent,
                content: item.content,
              })
            : preview;

        return (
          <Tooltip
            key={item.key}
            placement="right"
            title={<div className={styles.preview}>{previewNode}</div>}
          >
            <button
              aria-current={isCurrent || undefined}
              aria-label={item.label || `跳转到第 ${index + 1} 条消息`}
              className={styles.item}
              type="button"
              onPointerEnter={() => setHoveredIndex(index)}
              onPointerLeave={() => setHoveredIndex(null)}
              onClick={() => {
                changeActiveKey(item.key);
                onNavigate?.(item.key, item, index);
              }}
            >
              <span className={styles.track}>
                <span
                  className={styles.mark}
                  data-active={isCurrent ? 'true' : undefined}
                  data-hovered={isHovered ? 'true' : undefined}
                  style={{ transform: `scaleX(${scale})` }}
                />
              </span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
