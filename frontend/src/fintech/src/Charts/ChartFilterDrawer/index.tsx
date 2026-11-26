import { FilterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import DrawerBox from '../../DrawerBox';
import type { ActionRef } from '../../types';
import FilterPanel from './FilterPanel';
import type { ChartFilterDrawerProps } from './types';

const ChartFilterDrawer: React.FC<ChartFilterDrawerProps> = ({
  data,
  colorField,
  children,
  trigger,
  drawerProps = {},
  initialVisibleCount = 999,
  style,
  className,
}) => {
  const actionRef = useRef<ActionRef>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(() => {
    const uniqueCategories = Array.from(
      new Set(data.map((item) => item[colorField])),
    );
    return new Set(uniqueCategories.slice(0, initialVisibleCount));
  });
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(data.map((item) => item[colorField])));
  }, [data, colorField]);

  const filteredData = useMemo(() => {
    if (visibleItems.size === 0) return [];
    return data.filter((item) => visibleItems.has(item[colorField]));
  }, [data, colorField, visibleItems]);

  const handleToggleItem = useCallback((category: string) => {
    setVisibleItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const handleToggleAll = useCallback(
    (visible: boolean) => {
      setVisibleItems(visible ? new Set(uniqueCategories) : new Set());
    },
    [uniqueCategories],
  );

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const defaultTrigger = useMemo(
    () => <Button type="primary" icon={<FilterOutlined />} />,
    [],
  );

  const triggerPositionStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    zIndex: 10,
  };

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <div
        style={triggerPositionStyle}
        onClick={() => actionRef.current?.open(true)}
      >
        {trigger || defaultTrigger}
      </div>

      <DrawerBox
        closeIcon={false}
        footer={false}
        actionRef={actionRef}
        {...drawerProps}
      >
        <FilterPanel
          categories={uniqueCategories}
          visibleItems={visibleItems}
          onToggleItem={handleToggleItem}
          onToggleAll={handleToggleAll}
          searchKeyword={searchKeyword}
          onSearchChange={handleSearchChange}
        />
      </DrawerBox>

      {children(filteredData, uniqueCategories)}
    </div>
  );
};

export default ChartFilterDrawer;
