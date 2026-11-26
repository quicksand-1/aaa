/**
 * DescList 自动获取异步数据组件
 * @params
 *   url：请求地址
 *   params：请求参数
 *   dataPath：源数据路径
 *   trigger：触发条件；auto = 自动、hand = 手动
 *   actionRef：内置触发对象
 *     reload：重新请求
 *   formatData：数据转化函数
 * */

import { Spin } from 'antd';
import { useEffect, useImperativeHandle, useState } from 'react';
import request from '../fetch/request';
import type { ActionRef, DescListProps } from '../types';
import DescList from './index';

const Async = (props: Omit<DescListProps, 'dataSource'>) => {
  const {
    url = '',
    dataPath,
    params = {},
    manualRequest = false,
    actionRef,
    formatData,
    ...rest
  } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const query = () => {
    request(url, {
      setLoading,
      params,
      dataPath,
    }).then((res: any) => {
      setData(formatData ? formatData(res) : res);
    });
  };

  useEffect(() => {
    if (url && !manualRequest) {
      query();
    }
  }, []);

  // 提供给外部的接口
  useImperativeHandle(
    actionRef,
    () =>
      ({
        reload: query,
      } as ActionRef),
  );

  return (
    <Spin spinning={loading}>
      <DescList dataSource={data} {...rest} />
    </Spin>
  );
};

export default Async;
