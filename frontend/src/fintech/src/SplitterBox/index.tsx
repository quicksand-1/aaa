/**
 * 封装 Splitter，使其支持 items 的 api 写法
 * @params
 *   items：
 *      key：唯一标识
 *      open：是否展示
 *      children：面板内容
 *      splitter：递归嵌套的 SplitterBox 配置
 * */

import { Splitter } from 'antd';
import React from 'react';
import _filter from '../utils/_filter';

type AntdSplitterProps = React.ComponentProps<typeof Splitter>;
type AntdSplitterPanelProps = React.ComponentProps<typeof Splitter.Panel>;

/**
 * `SplitterBox` 的单个面板配置。
 * 基于 antd `Splitter.Panel` 扩展，并增加了 `open`、`splitter` 等便捷字段。
 */
export interface SplitterBoxItem
  extends Omit<AntdSplitterPanelProps, 'children'> {
  /** 唯一标识，用于 React 渲染和面板列表区分。 */
  key: React.Key;
  /** 是否渲染当前面板，默认为 `true`。 */
  open?: boolean | ((item: SplitterBoxItem) => boolean);
  /** 面板内容。 */
  children?: React.ReactNode;
  /** 嵌套的 `SplitterBox` 配置，用于声明式构建复杂分栏布局。 */
  splitter?: SplitterBoxProps;
}

/**
 * `SplitterBox` 组件属性。
 * 保留 antd `Splitter` 的大部分容器属性，但仅支持 `items` 声明式写法。
 */
export interface SplitterBoxProps extends Omit<AntdSplitterProps, 'children'> {
  /** 面板配置列表。 */
  items: SplitterBoxItem[];
}

const renderChildren = (item: SplitterBoxItem) => {
  const { children, splitter } = item;

  if (splitter) {
    return (
      <SplitterBox
        {...splitter}
        style={{
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          ...splitter.style,
        }}
      />
    );
  }

  return children;
};

/**
 * 对 antd `Splitter` 的二次封装。
 * 目标是提供 `items` 写法，减少手写 `Splitter.Panel` 的样板代码。
 */
const SplitterBox: React.FC<SplitterBoxProps> = (props) => {
  const { items, ...rest } = props;
  const renderPanels = () => {
    return _filter(items).map((item) => {
      const {
        key,
        open,
        children: panelChildren,
        splitter,
        ...panelProps
      } = item;

      return (
        <Splitter.Panel key={key} {...panelProps}>
          {renderChildren({
            key,
            open,
            children: panelChildren,
            splitter,
          })}
        </Splitter.Panel>
      );
    });
  };

  return <Splitter {...rest}>{renderPanels()}</Splitter>;
};

export default SplitterBox;
