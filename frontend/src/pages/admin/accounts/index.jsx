import { useRef } from 'react';
import { Button, message } from 'antd';
import { LinkBtn, ProTableAsync, request } from 'fintech';
import EditDrawer from './EditDrawer';
import ResetPasswordModal from './ResetPasswordModal';

export default function AccountsPage() {
  const tableRef = useRef(null);
  const resetRef = useRef(null);

  const changeStatus = (record, status) =>
    request(`/users/${record.id}/status`, {
      method: 'PUT',
      data: { status },
    }).then(() => {
      message.success(status ? '账号已启用' : '账号已停用');
      tableRef.current?.reload();
    });

  const remove = (record) =>
    request(`/users/${record.id}`, { method: 'DELETE' }).then(() => {
      message.success('账号已删除');
      tableRef.current?.reload();
    });

  return (
    <>
      <ProTableAsync
        columnEmptyText=""
        actionRef={tableRef}
        rowKey="id"
        url="/users"
        search={false}
        columns={[
          { title: '登录账号', dataIndex: 'username' },
          { title: '姓名/备注', dataIndex: 'name' },
          { title: '角色', dataIndex: 'role' },
          {
            title: '管理员',
            dataIndex: 'isAdmin',
            valueType: 'select',
            valueEnum: { true: '是', false: '否' },
          },
          {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
              true: { text: '启用', status: 'Success' },
              false: { text: '停用', status: 'Error' },
            },
          },
          {
            title: '强制改密',
            dataIndex: 'needModifiedPwd',
            valueType: 'select',
            valueEnum: { true: '是', false: '否' },
          },
          {
            width: 180,
            title: '最后登录',
            dataIndex: 'lastLoginAt',
            valueType: 'dateTime',
          },
          {
            width: 200,
            valueType: 'option',
            render: (_, record) => [
              <EditDrawer
                key="edit"
                data={record}
                onSaved={() => tableRef.current?.reload()}
              >
                <LinkBtn>编辑</LinkBtn>
              </EditDrawer>,
              <LinkBtn
                key="reset"
                onClick={() => resetRef.current?.open(record)}
              >
                重置密码
              </LinkBtn>,
              <LinkBtn
                key="status"
                open={record.status}
                title="停用账号"
                content={`确定停用「${record.username}」？停用后该账号立即退出登录。`}
                onOk={() => changeStatus(record, false)}
              >
                停用
              </LinkBtn>,
              <LinkBtn
                key="enable"
                open={!record.status}
                title="启用账号"
                content={`确定启用「${record.username}」？`}
                onOk={() => changeStatus(record, true)}
              >
                启用
              </LinkBtn>,
              <LinkBtn
                key="delete"
                color="red"
                title="删除账号"
                content={`确定删除「${record.username}」？删除后不可恢复。`}
                onOk={() => remove(record)}
              >
                删除
              </LinkBtn>,
            ],
          },
        ]}
        toolBarRender={() => [
          <EditDrawer key="add" onSaved={() => tableRef.current?.reload()}>
            <Button type="primary">新增账号</Button>
          </EditDrawer>,
        ]}
      />
      <ResetPasswordModal
        ref={resetRef}
        onSaved={() => tableRef.current?.reload()}
      />
    </>
  );
}
