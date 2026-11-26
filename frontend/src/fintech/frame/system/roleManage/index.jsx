import { Button, message } from 'antd';
import { LinkBtn, Permission, ProTableAsync, request } from 'fintech';
import { useRef } from 'react';
import EditDrawer from './EditDrawer';

const RoleList = () => {
  const isAccess = Permission.useAccess();
  const ref = useRef();

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
    },
    {
      title: '备注',
      ellipsis: true,
      dataIndex: 'description',
    },
    {
      title: '操作',
      valueType: 'option',
      hideInTable: !isAccess(['role_edit', 'role_detail', 'role_del'], 'some'),
      render: (_, record) => [
        <Permission.Access key="editable" code="role_edit">
          <EditDrawer actionRef={ref} data={record}>
            <LinkBtn>编辑</LinkBtn>
          </EditDrawer>
        </Permission.Access>,
        <Permission.Access key="detail" code="role_detail">
          <EditDrawer actionRef={ref} data={record} editable={false}>
            <LinkBtn>查看</LinkBtn>
          </EditDrawer>
        </Permission.Access>,
        <Permission.Access key="delete" code="role_del">
          <LinkBtn
            color="red"
            title="删除"
            content="确定删除该角色？"
            onOk={() => {
              request(`/system/role/remove.json?roleCode=${record.roleCode}`, {
                method: 'DELETE',
              }).then(() => {
                message.success('删除成功');
                ref.current?.reload();
              });
            }}
          >
            删除
          </LinkBtn>
        </Permission.Access>,
      ],
    },
  ];
  return (
    <ProTableAsync
      search={false}
      actionRef={ref}
      rowKey="roleCode"
      columns={columns}
      url="/system/role/page.json"
      toolBarRender={() => [
        <Permission.Access key="add" code="role_add">
          <EditDrawer actionRef={ref}>
            <Button type="primary">新增角色</Button>
          </EditDrawer>
        </Permission.Access>,
      ]}
    />
  );
};
export default RoleList;
