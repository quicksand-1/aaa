import { message } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';
import { cloneElement, useRef, useState } from 'react';

export default (props) => {
  const { children, data, actionRef, editable = true, ...rest } = props;

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
        title={editable ? '角色编辑' : '角色查看'}
        footer={editable ? ['cancel', 'ok'] : false}
        onOk={({ values, open }) => {
          request(
            values.roleCode
              ? '/system/role/edit.json'
              : '/system/role/add.json',
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
          // 如果角色存在
          if (data?.roleCode) {
            request(`/system/role/detail.json?roleCode=${data.roleCode}`, {
              setLoading,
              method: 'GET',
            }).then((res) => {
              drawerRef.current?.form.setFieldsValue({
                ...data,
                menuCodes: res.menuCodes,
              });
            });
          }
        }}
      >
        <FormSchema
          unique="roleCode"
          items={[
            { name: 'roleName', label: '角色名称' },
            {
              name: 'description',
              label: '备注',
              valueType: 'textarea',
              required: false,
            },
            {
              /**
               * 权限配置中，后端是支持只传根节点权限码（子节点不传）的方式的，info.json 中也只会返回父节点；
               * @PS：后面如果需要，可以将 tree 改造成 ”父/子 节点不关联的方式“
               ***/
              name: 'menuCodes',
              label: '权限配置',
              valueType: 'tree',
              inputProps: {
                cache: true,
                url: '/system/menu/list/tree.json',
              },
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
