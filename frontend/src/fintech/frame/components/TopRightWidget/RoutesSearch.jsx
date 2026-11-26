/**
 * 页面搜索功能，根据 routes 配置生成搜索框
 * */

import { SearchOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { TreeSelect } from 'antd';
import { useState } from 'react';

/**
 * 过滤路由信息
 * @不需要展示的路由
 *   - hideInMenu = true
 * */
const loopRoutes = (routes = []) => {
  const list = [];
  routes.forEach((item) => {
    if (['/.', '/welcome', '/'].includes(item.path) || item.hideInMenu) {
      return;
    }

    const childRoutes = loopRoutes(item.children);

    list.push({
      ...item,
      children: childRoutes.length > 0 ? childRoutes : undefined,
    });
  });
  return list;
};

export default () => {
  const [routes] = useState(() => {
    return loopRoutes(window.routes);
  });

  if (routes[0]) {
    return (
      <TreeSelect
        showSearch
        variant="borderless"
        treeData={routes}
        prefix={<SearchOutlined style={{ color: '#999' }} />}
        treeNodeFilterProp="name"
        style={{ width: 200, background: '#f5f7fa', borderRadius: 4 }}
        placeholder="菜单搜索"
        suffixIcon=""
        value={null}
        listHeight={300}
        fieldNames={{
          label: 'name',
          value: 'path',
          children: 'children',
        }}
        onChange={(value) => {
          history.push(value);
        }}
      />
    );
  }

  return null;
};
