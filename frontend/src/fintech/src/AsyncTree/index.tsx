import { Spin, Tree } from 'antd';
import { useEffect, useState } from 'react';
import cacheRequest from '../fetch/cacheRequest';
import _typeOf from '../utils/_typeOf';

export default (props: any) => {
  const {
    value,
    onChange,
    fields = ['key', 'title', 'children'],
    url = '',
    dataPath,
    cache = false,
    params = {},
    formatData,
    ...rest
  } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  /**
   * 请求数据
   * 1、如果开启了 cache，则表示当前页面有很多一样的请求，则进行缓存操作
   * */
  const query = () => {
    if (!url) return;

    cacheRequest(url, {
      cache,
      params,
      dataPath,
      setLoading,
    }).then((res: any) => {
      const d = formatData ? formatData(res) : res;
      setData(d);
    });
  };

  useEffect(() => {
    query();
  }, []);

  return (
    <Spin spinning={loading}>
      <Tree
        checkable
        checkedKeys={value}
        onCheck={(ks: any, e) => {
          if (_typeOf(ks, 'Array')) {
            onChange(ks, e);
          } else if (_typeOf(ks, 'Object')) {
            onChange(ks.checked, ks, e);
          }
        }}
        fieldNames={{
          key: fields[0],
          title: fields[1],
          children: fields[2],
        }}
        {...rest}
        treeData={data?.length > 0 ? data : rest.treeData}
      />
    </Spin>
  );
};
