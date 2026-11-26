/**
 * 开关的异步操作
 * @params
 *   url: 请求地址
 *   name: 布尔值关键字段
 *   params: 额外的入参
 *   defaultChecked: 默认是否选中
 *   beforeChange: 切换前的回调函数，返回 false 可阻止切换；返回对象会合并到请求的 data 中
 *   onOk: 异步请求成功后的回调函数
 * */

import { Switch } from 'antd';
import { useEffect, useState } from 'react';
import request from '../fetch/request';

type AsyncSwitchProps = {
  url: string;
  name: string;
  nameEnum: [boolean | string, boolean | string];
  params?: Record<string, any>;
  defaultChecked?: boolean;
  onOk?: (bool: boolean, res: any) => void;
  beforeChange?: (
    bool: boolean,
  ) =>
    | Record<string, any>
    | Promise<Record<string, any>>
    | false
    | Promise<false>
    | void
    | Promise<void>;
};

export default (props: AsyncSwitchProps) => {
  const {
    url,
    name = 'status',
    nameEnum = [false, true],
    params = {},
    defaultChecked = false,
    onOk = () => {},
    beforeChange,
    ...rest
  } = props;

  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  return (
    <Switch
      size="small"
      loading={loading}
      checked={checked}
      onChange={async (bool) => {
        // 调用 beforeChange，如果返回 false 则阻止后续操作
        let beforeChangeResult: Record<string, any> = {};
        if (beforeChange) {
          const result = await Promise.resolve(beforeChange(bool));
          // 如果返回 false，则取消操作
          if (result === false) {
            return;
          }
          // 如果返回对象，则合并到请求数据中
          if (result && typeof result === 'object' && !Array.isArray(result)) {
            beforeChangeResult = result;
          }
        }

        const data = {
          ...(name ? { ...params, [name]: nameEnum[bool ? 1 : 0] } : params),
          ...beforeChangeResult,
        };
        request(url, {
          setLoading,
          method: 'POST',
          data,
        }).then((res) => {
          setChecked(bool);
          // 返回 res 给 onOk 回调函数，用于后续操作
          onOk(bool, res);
        });
      }}
      {...rest}
    />
  );
};
