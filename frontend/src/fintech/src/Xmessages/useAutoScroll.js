import { useCallback, useEffect, useRef, useState } from 'react';

const BOTTOM_THRESHOLD = 24;

function isAtScrollBottom(element, autoScroll) {
  if (!element || element.scrollHeight <= element.clientHeight) {
    return true;
  }

  if (autoScroll) {
    return element.scrollTop >= -BOTTOM_THRESHOLD;
  }

  return (
    element.scrollHeight - element.clientHeight - element.scrollTop <=
    BOTTOM_THRESHOLD
  );
}

export default function useAutoScroll({
  ref,
  loading = false,
  items = [],
  enabled = true,
  onScroll,
}) {
  const internalRef = useRef(null);
  const listRef = ref || internalRef;
  const atBottomRef = useRef(true);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false);

  const updateScrollPosition = useCallback(() => {
    const scrollBox = listRef.current?.scrollBoxNativeElement;
    const atBottom = isAtScrollBottom(scrollBox, enabled);

    atBottomRef.current = atBottom;
    setScrollToBottomVisible(!atBottom);
  }, [enabled, listRef]);

  const handleScroll = useCallback(
    (event) => {
      updateScrollPosition();
      onScroll?.(event);
    },
    [onScroll, updateScrollPosition],
  );

  useEffect(() => {
    if (loading || items.length === 0 || !listRef.current) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (enabled && atBottomRef.current) {
        listRef.current?.scrollTo({
          top: 'bottom',
          behavior: 'smooth',
        });
      } else {
        updateScrollPosition();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [enabled, items, listRef, loading, updateScrollPosition]);

  return {
    handleScroll,
    listRef,
    scrollToBottomVisible,
  };
}
