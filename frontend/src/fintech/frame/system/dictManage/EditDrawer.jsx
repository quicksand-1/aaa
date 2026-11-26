import { message } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';
import { cloneElement, useRef, useState } from 'react';

export default (props) => {
  const { children, data, actionRef, ...rest } = props;

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const wrappedChild = cloneElement(children, {
    ...rest,
    onClick: () => {
      drawerRef.current?.open(true);
    },
  });

  return (
    <>
      {wrappedChild}
      <DrawerBox
        form
        actionRef={drawerRef}
        confirmLoading={loading}
        title={data ? '编辑字典' : '新增字典'}
        onOk={({ values, open }) => {
          request(
            values.dictId ? '/system/dict/edit.json' : '/system/dict/add.json',
            {
              setLoading,
              method: 'POST',
              data: values,
            },
          ).then(() => {
            open(false);
            actionRef.current?.reload();
            message.success('保存成功');
          });
        }}
        afterOpen={() => {
          if (data) {
            drawerRef.current?.form.setFieldsValue({
              ...data,
              dictId: data.id,
            });
          }
        }}
      >
        <FormSchema
          unique="dictId"
          items={[
            {
              name: 'dictKey',
              label: '字典编号',
              validateFirst: true,
              rules: {
                pattern: /^[^\u4e00-\u9fa5!@#$%^&*\s]+$/,
                message: '不支持中文、空格、!@#$%^&*等字符',
              },
            },
            {
              name: 'dictName',
              label: '字典名称',
            },
            {
              name: 'attr',
              label: '属性',
              required: false,
              valueType: 'textarea',
            },
            { name: 'description', label: '备注', required: false },
          ]}
        />
      </DrawerBox>
    </>
  );
};
