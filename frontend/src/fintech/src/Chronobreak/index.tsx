/**
 * 时空断裂：提取上一次的数据，并回填表单
 * */

import { Button, Tooltip } from 'antd';
import { cloneElement, useState } from 'react';
import storageSQL from '../utils/storageSQL';

const FROM = 'Chronobreak';

const storage = {
  get: ({ id }) => {
    return storageSQL('find', { from: FROM, where: `id=${id}` });
  },
  set: ({ id, values }) => {
    storageSQL('duplicate', {
      from: FROM,
      where: `id=${id}`,
      values: {
        v: values,
        id,
      },
    });
  },
};

const Chronobreak = ({
  id,
  form,
  tooltip = '检测到您之前填写过此表单，点击「回显」按钮可快速恢复上次输入内容，节省您的时间。',
  children,
  ...rest
}) => {
  const [data, setData] = useState(() => {
    return storage.get({ id });
  });

  if (data.v) {
    const onClick = () => {
      form.setFieldsValue(data.v);
      setData({});
    };

    return (
      <Tooltip title={tooltip}>
        {rest.children ? (
          cloneElement(rest.children, {
            ...rest,
            onClick,
          })
        ) : (
          <Button color="cyan" variant="solid" onClick={onClick}>
            回显
          </Button>
        )}
      </Tooltip>
    );
  }

  return null;
};

Chronobreak.storage = storage;

export default Chronobreak;
