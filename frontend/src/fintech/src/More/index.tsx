/**
 * 将很多的操作按钮合并到 Dropdown 进行渲染
 * 1、默认展示X个，其余多的收拢到 Dropdown 中
 * 2、判断多余收拢的列表是否符合渲染要求，符合则渲染，不符合则不渲染
 * 3、items 返回的是 ReactNode 形式数组，而 Dropdown 需要 items 格式为 { key: string, label: ReactNode }[]，需要进行转化
 * */
import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import React from 'react';
import _filter from '../utils/_filter';

interface Item {
  open?: boolean;
  children?: React.ReactNode;
}

interface MoreProps {
  items?: Item[];
  maxShow?: number;
}

const More = ({ items = [], maxShow = 2 }: MoreProps) => {
  const filterItems = _filter(items);

  // 分割直接显示和下拉中的项目
  const visibleItems = filterItems.slice(0, maxShow);
  const dropdownItems = filterItems.slice(maxShow);

  // 过滤掉无效的项目并转换格式
  const validDropdownItems = dropdownItems.map((item, index) => ({
    key: `more-item-${index}`,
    label: item.children,
  }));

  return (
    <Space>
      {visibleItems.map((item, index) => (
        <React.Fragment key={index}>{item.children}</React.Fragment>
      ))}
      {validDropdownItems.length > 0 && (
        <Dropdown menu={{ items: validDropdownItems }} trigger={['hover']}>
          <a onClick={(e) => e.preventDefault()} style={{ fontWeight: 'bold' }}>
            <MoreOutlined />
          </a>
        </Dropdown>
      )}
    </Space>
  );
};

export default More;
