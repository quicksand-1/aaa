import { Button, message } from 'antd';
import { LinkBtn, Permission, ProTableAsync, request } from 'fintech';
import { useRef } from 'react';
import DataDrawer from './DataDrawer';
import EditDrawer from './EditDrawer';

const UserList = () => {
  const isAccess = Permission.useAccess();
  const ref = useRef();

  const columns = [
    {
      title: '姓名',
      dataIndex: 'userName',
      search: true,
    },
    {
      title: '账号',
      dataIndex: 'account',
      search: true,
    },
    {
      search: true,
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        1: { text: '启用', status: 'Success' },
        2: { text: '停用', status: 'Default' },
        3: { text: '删除', status: 'Error' },
      },
    },
    {
      title: '角色',
      dataIndex: 'roleName',
    },
    {
      title: '所属部门',
      renderText: (r) => `${r.pDeptName} /${r.deptName}`,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      search: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '备注',
      ellipsis: true,
      dataIndex: 'description',
    },
    {
      title: '定期修改密码',
      dataIndex: 'modifiedPwdPeriodSign',
      renderText: (t) => (t ? '✅' : ''),
    },
    {
      width: 260,
      title: '操作',
      valueType: 'option',
      hideInTable: !isAccess(
        [
          'mgr_edit',
          'mgr_disable',
          'mgr_enable',
          'mgr_reset',
          'mgr_del',
          'mgr_data',
        ],
        'some',
      ),
      render: (_, record) => [
        <Permission.Access key="edit" code="mgr_edit">
          <EditDrawer actionRef={ref} data={record}>
            <LinkBtn>编辑</LinkBtn>
          </EditDrawer>
        </Permission.Access>,
        <Permission.Access key="data" code="mgr_data">
          <DataDrawer data={record} />
        </Permission.Access>,
        <Permission.Access key="disable" code="mgr_disable">
          <LinkBtn
            color="orange"
            title="停用"
            hidden={record.status === '2'}
            content="确定停用该用户？"
            onOk={() => {
              request('/system/user/disable.json', {
                params: {
                  status: record.status,
                  userCode: record.userCode,
                },
              }).then(() => {
                message.success('停用成功');
                ref.current?.reload();
              });
            }}
          >
            停用
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access key="enable" code="mgr_enable">
          <LinkBtn
            color="green"
            title="启用"
            hidden={record.status === '1'}
            content="确定启用该用户？"
            onOk={() => {
              request('/system/user/enable.json', {
                params: {
                  status: record.status,
                  userCode: record.userCode,
                },
              }).then(() => {
                message.success('启用成功');
                ref.current?.reload();
              });
            }}
          >
            启用
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access key="reset" code="mgr_reset">
          <LinkBtn
            title="重置密码"
            content="确定重置用户密码？"
            onOk={() => {
              request(
                `/system/user/reset.json?userCode=${record.userCode}`,
              ).then(() => {
                message.success('重置密码成功');
                ref.current?.reload();
              });
            }}
          >
            重置密码
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access key="del" code="mgr_del">
          <LinkBtn
            color="red"
            title="删除"
            content="确定删除该用户？"
            onOk={() => {
              request(`/system/user/remove.json?userCode=${record.userCode}`, {
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
      actionRef={ref}
      columns={columns}
      rowKey="userCode"
      url="/system/user/page.json"
      toolBarRender={() => [
        <Permission.Access code="mgr_add" key="mgr_add">
          <EditDrawer actionRef={ref}>
            <Button type="primary">新增用户</Button>
          </EditDrawer>
        </Permission.Access>,
      ]}
    />
  );
};

export default UserList;
