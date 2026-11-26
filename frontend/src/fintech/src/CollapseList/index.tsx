/**
 * 1、使 Collapse 支持 items 的 api 写法
 * @params
 *   items：
 *      key：唯一标识
 *      open：是否展示
 *      extra：额外的操作空间
 *      label：标题内容
 *      children: 填充 Panel 的内容部分，最多承接2个长度的数组
 * */

import { RetweetOutlined } from '@ant-design/icons';
import type { CollapseProps } from 'antd';
import { Collapse, Space, Spin } from 'antd';
import { ReactNode, useState } from 'react';
import _filter from '../utils/_filter';
import _typeOf from '../utils/_typeOf';

interface CollapseLayoutProps extends CollapseProps {
  items?: {
    key: string;
    loading?: boolean;
    extra?: ReactNode;
    label: ReactNode;
    children?: ReactNode | [ReactNode, ReactNode];
    open?: boolean;
  }[];
}

const CollapseLayout: React.FC<CollapseLayoutProps> = (props) => {
  const { items = [], ...rest } = props;

  const [layoutKeys, setLayoutKeys] = useState({});

  const renderChildren = ({ children, childrenIsList, key }: any) => {
    if (childrenIsList && children.length > 1) {
      return children[layoutKeys[key] ?? 0];
    }

    if (childrenIsList) {
      return children[0];
    }

    return children;
  };

  return (
    <Collapse
      {...rest}
      items={_filter(items).map(({ loading = false, ...item }) => {
        const childrenIsList = _typeOf(item.children, 'Array');

        return {
          ...item,
          extra: (
            <Space>
              {item.extra}
              {childrenIsList && item.children.length > 1 && (
                <RetweetOutlined
                  onClick={(e) => {
                    e.stopPropagation(); // 冒泡
                    e.preventDefault(); // 捕获
                    const currentIndex = layoutKeys[item.key] || 0;
                    const nextIndex =
                      currentIndex + 1 > item.children.length - 1
                        ? 0
                        : currentIndex + 1;
                    setLayoutKeys({ ...layoutKeys, [item.key]: nextIndex });
                  }}
                />
              )}
            </Space>
          ),
          children: (
            <Spin spinning={loading}>
              {renderChildren({
                ...item,
                childrenIsList,
              })}
            </Spin>
          ),
        };
      })}
    />
  );
};

export default CollapseLayout;
