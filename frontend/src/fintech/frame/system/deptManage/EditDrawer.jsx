import { message } from 'antd';
import { DrawerBox, FormSchema, LinkBtn, request, SelectList } from 'fintech';
import { useRef, useState } from 'react';

export default (props) => {
  const { data = {}, type, query, setSelectedNode } = props;

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const isAdd = type === 'add';

  return (
    <>
      <LinkBtn
        onClick={() => {
          drawerRef.current?.open(true);
          if (!isAdd) {
            // 填充
            drawerRef.current?.form.setFieldsValue(data);
          }
        }}
      >
        {isAdd ? '新增' : '编辑'}
      </LinkBtn>
      <DrawerBox
        form
        actionRef={drawerRef}
        confirmLoading={loading}
        title="部门编辑"
        onOk={({ values, open }) => {
          request(isAdd ? '/system/org/add.json' : '/system/org/edit.json', {
            setLoading,
            method: 'POST',
            data: {
              ...values,
              simpleName: values.title,
              [isAdd ? 'pcode' : 'code']: data.key,
            },
          }).then(() => {
            query?.();
            open(false);
            message.success('保存成功');
            if (!isAdd) {
              setSelectedNode({
                ...data,
                ...values,
              });
            }
          });
        }}
      >
        <FormSchema
          items={[
            { name: 'title', label: '部门名称' },
            {
              name: 'type',
              label: '部门性质',
              children: (
                <SelectList
                  fields={['dictKey', 'dictName']}
                  url={`/system/dict/select/orgLevel.json?type=${data.type}`}
                />
              ),
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
