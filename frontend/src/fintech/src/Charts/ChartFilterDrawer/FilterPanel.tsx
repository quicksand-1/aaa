import { SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Space } from 'antd';
import useComposing from '../../hooks/useComposing';
import useDebounce from '../../hooks/useDebounce';
import { getCategoryColor } from './colorUtils';
import type { FilterPanelProps } from './types';

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  visibleItems,
  onToggleItem,
  onToggleAll,
  searchKeyword,
  onSearchChange,
}) => {
  const { isComposing, ...compositionProps } = useComposing();

  const filteredCategories = React.useMemo(() => {
    if (!searchKeyword) return categories;
    const keyword = searchKeyword.toLowerCase();
    return categories.filter((category) =>
      String(category).toLowerCase().includes(keyword),
    );
  }, [categories, searchKeyword]);

  const allChecked =
    categories.length === 0 ||
    categories.every((category) => visibleItems.has(category));

  const getItemStyle = (category: string): React.CSSProperties => {
    const isVisible = visibleItems.has(category);
    return {
      display: 'flex',
      alignItems: 'center',
      fontSize: '13px',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: isVisible ? 'rgba(24, 144, 255, 0.06)' : 'transparent',
      color: isVisible ? '#1890ff' : '#999',
      fontWeight: isVisible ? 500 : 400,
    };
  };

  const getItemHoverStyle = (category: string): React.CSSProperties => {
    const isVisible = visibleItems.has(category);
    return {
      backgroundColor: isVisible ? 'rgba(24, 144, 255, 0.1)' : '#f5f5f5',
    };
  };

  return (
    <div>
      {categories.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
                color: allChecked ? '#1890ff' : '#999',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: allChecked
                  ? 'rgba(24, 144, 255, 0.06)'
                  : 'transparent',
                whiteSpace: 'nowrap',
              }}
              onClick={() => onToggleAll(!allChecked)}
            >
              全选 ({visibleItems.size}/{categories.length})
            </div>
            <Input
              allowClear
              placeholder="搜索分类..."
              prefix={<SearchOutlined />}
              onChange={useDebounce((e) => {
                if (isComposing) return;
                onSearchChange(e.target.value);
              })}
              style={{ flex: 1, minWidth: 0 }}
              {...compositionProps}
            />
          </div>
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      <div style={{ height: 'calc(100vh - 165px)', overflowY: 'auto' }}>
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          {filteredCategories.map((category) => (
            <div
              key={category}
              style={getItemStyle(category)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  getItemHoverStyle(category).backgroundColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  getItemStyle(category).backgroundColor;
              }}
              onClick={() => onToggleItem(category)}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: getCategoryColor(category, categories),
                  marginRight: '8px',
                  flexShrink: 0,
                  opacity: visibleItems.has(category) ? 1 : 0.3,
                }}
              />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {category}
              </span>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div
              style={{
                color: '#999',
                fontSize: '13px',
                textAlign: 'center',
                padding: '16px',
              }}
            >
              未找到匹配的分类
            </div>
          )}
        </Space>
      </div>
    </div>
  );
};

export default FilterPanel;
