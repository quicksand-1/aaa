/**
 * 判断值是否是 ReactNode 对象
 * all: 包含所有
 * node: 是不是标准的 react.element 对象
 * */

import React from 'react';

const _isReactNode = {
  all: (value: any): value is React.ReactNode => {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value === null ||
      (typeof value === 'object' &&
        (value.$$typeof === Symbol.for('react.element') ||
          (Array.isArray(value) && value.every(_isReactNode.all))))
    );
  },
  node: (value: any) => {
    return (
      typeof value === 'object' &&
      value.$$typeof === Symbol.for('react.element')
    );
  },
};

export default _isReactNode;
