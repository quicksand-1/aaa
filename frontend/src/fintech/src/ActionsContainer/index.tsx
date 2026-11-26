/**
 * 自定义操作内容和默认内容的组件
 * @defaultActions：{ key: ReactNode }
 * @actions：['key', 'key2', ReactNode]
 * */

import { Space } from 'antd';
import { cloneElement } from 'react';

/**
 * 操作容器组件，用于渲染默认操作和自定义操作的组合
 * @param defaultActions 默认操作映射对象，key对应操作标识，value为ReactNode元素
 * @param actions 操作数组，可以是字符串key（引用defaultActions中的元素）或直接的ReactNode元素
 * @returns 渲染操作按钮的容器组件
 */
const ActionsContainer = ({ defaultActions = {}, actions = [] }) => {
  return (
    <Space>
      {
        /**
         * 遍历操作数组，根据元素类型渲染对应的操作组件
         * 字符串类型：从defaultActions中查找对应的预定义组件
         * ReactNode类型：直接渲染该组件
         */
        actions &&
          actions.map((item) => {
            if (typeof item === 'string' && defaultActions[item]) {
              return cloneElement(defaultActions[item], {
                key: item,
              });
            }
            return item;
          })
      }
    </Space>
  );
};

export default ActionsContainer;
