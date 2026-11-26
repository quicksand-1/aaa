import { Alert, Button, message } from 'antd';
import { LinkBtn, Permission, ProTableAsync, request } from 'fintech';
import React, { useRef, useState } from 'react';
import AccessLogDrawer from '../_components/AccessLogDrawer';
import AdminCreateSecretDrawer from './AdminCreateSecretDrawer';
import AdminEditSecretDrawer from './AdminEditSecretDrawer';
import AdminSecretModal from './AdminSecretModal';

const STATUS_ENUM = {
  1: { text: '启用', status: 'Success' },
  2: { text: '停用', status: 'Default' },
};

function isEnabled(record) {
  return String(record?.status) === '1';
}

function transformTimeRange(value) {
  const format = (item) =>
    typeof item?.format === 'function'
      ? item.format('YYYY-MM-DD HH:mm:ss')
      : item;
  return { startTime: format(value?.[0]), endTime: format(value?.[1]) };
}

function sanitizeDetail(response) {
  if (!response) return null;
  const {
    accessToken,
    account,
    expiresAt,
    lastUsedIp,
    lastUsedTime,
    orgName,
    scopes,
    status,
    tokenName,
    usageCount,
    userCode,
    userName,
  } = response;
  return {
    accessToken,
    account,
    expiresAt,
    lastUsedIp,
    lastUsedTime,
    orgName,
    scopes,
    status,
    tokenName,
    usageCount,
    userCode,
    userName,
  };
}

/** 管理员跨机构代管全部用户 Token，不复用本人接口或权限。 */
export default function AdminSecretPage() {
  const isAccess = Permission.useAccess();
  const actionRef = useRef(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationKey, setOperationKey] = useState('');
  const [secretDetail, setSecretDetail] = useState(null);

  const runFormAction = (record, action, data, successMessage) => {
    const key = `${action}-${record.id}`;
    setOperationKey(key);
    request(`/system/apitoken/admin/${action}.json`, {
      data: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      method: 'POST',
      setLoading: setOperationLoading,
    })
      .then(() => {
        message.success(successMessage);
        actionRef.current?.reload();
      })
      .finally(() => setOperationKey(''));
  };

  const columns = [
    { dataIndex: 'userCode', title: '用户编码', width: 130 },
    { dataIndex: 'account', title: '账号', width: 130 },
    { dataIndex: 'userName', title: '姓名', width: 120 },
    { dataIndex: 'orgCode', hideInTable: true, title: '机构编码' },
    { dataIndex: 'orgName', search: false, title: '所属机构', width: 160 },
    { dataIndex: 'tokenName', title: 'Token 名称', width: 180 },
    {
      dataIndex: 'status',
      title: '状态',
      valueEnum: STATUS_ENUM,
      valueType: 'tag',
      width: 90,
    },
    {
      dataIndex: 'createTimeRange',
      hideInTable: true,
      search: { transform: transformTimeRange },
      title: '创建时间',
      valueType: 'dateTimeRange',
    },
    {
      dataIndex: 'expiresAt',
      renderText: (value) => value || '不限期限',
      search: false,
      title: '过期时间',
      width: 170,
    },
    {
      dataIndex: 'usageCount',
      renderText: (value) => value ?? '0',
      search: false,
      title: '调用次数',
      width: 90,
    },
    {
      dataIndex: 'lastUsedTime',
      render: (_, record) =>
        record.lastUsedTime ? (
          <div>
            <div>{record.lastUsedTime}</div>
            <div className="text-xs text-slate-400">
              {record.lastUsedIp || '-'}
            </div>
          </div>
        ) : (
          '-'
        ),
      search: false,
      title: '最近使用',
      width: 180,
    },
    {
      dataIndex: 'gmtCreate',
      renderText: (value, record) => value || record.createTime || '-',
      search: false,
      title: '创建时间',
      width: 170,
    },
    {
      dataIndex: 'gmtModified',
      renderText: (value, record) => value || record.modifyTime || '-',
      search: false,
      title: '修改时间',
      width: 170,
    },
    {
      fixed: 'right',
      hideInTable: !isAccess(
        [
          'apitoken_admin_detail',
          'apitoken_admin_edit',
          'apitoken_admin_status',
          'apitoken_admin_delete',
          'apitoken_admin_access_logs',
        ],
        'some',
      ),
      render: (_, record) => [
        <Permission.Access code="apitoken_admin_detail" key="detail">
          <LinkBtn
            onClick={() => {
              request('/system/apitoken/admin/detail.json', {
                method: 'GET',
                params: { tokenId: record.id },
                setLoading: setOperationLoading,
              }).then((response) => setSecretDetail(sanitizeDetail(response)));
            }}
          >
            查看明文
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access code="apitoken_admin_edit" key="edit">
          <AdminEditSecretDrawer
            onSaved={() => actionRef.current?.reload()}
            record={record}
          >
            <LinkBtn>编辑</LinkBtn>
          </AdminEditSecretDrawer>
        </Permission.Access>,
        <AccessLogDrawer
          key="logs"
          record={record}
          url="/system/apitoken/admin/access-logs.json"
        >
          <LinkBtn open={isAccess('apitoken_admin_access_logs')}>
            调用日志
          </LinkBtn>
        </AccessLogDrawer>,
        <Permission.Access code="apitoken_admin_status" key="disable">
          <LinkBtn
            color="orange"
            content="停用后，该秘钥的 Bearer 调用会立即失效，确定停用？"
            loading={operationLoading && operationKey === `status-${record.id}`}
            onOk={() =>
              runFormAction(
                record,
                'status',
                { status: '2', tokenId: String(record.id) },
                '秘钥已停用',
              )
            }
            open={isEnabled(record)}
            title="停用秘钥"
          >
            停用
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access code="apitoken_admin_status" key="enable">
          <LinkBtn
            color="green"
            content="确定重新启用该用户的秘钥？"
            loading={operationLoading && operationKey === `status-${record.id}`}
            onOk={() =>
              runFormAction(
                record,
                'status',
                { status: '1', tokenId: String(record.id) },
                '秘钥已启用',
              )
            }
            open={!isEnabled(record)}
            title="启用秘钥"
          >
            启用
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access code="apitoken_admin_delete" key="delete">
          <LinkBtn
            color="red"
            content="删除后无法恢复，历史调用日志仍会保留，确定删除？"
            loading={operationLoading && operationKey === `delete-${record.id}`}
            onOk={() =>
              runFormAction(
                record,
                'delete',
                { tokenId: String(record.id) },
                '秘钥已删除',
              )
            }
            open={!isEnabled(record)}
            title="删除秘钥"
          >
            删除
          </LinkBtn>
        </Permission.Access>,
      ],
      search: false,
      title: '操作',
      valueType: 'option',
      width: 320,
    },
  ];

  return (
    <>
      <ProTableAsync
        actionRef={actionRef}
        columns={columns}
        headerTitle={
          <Alert
            showIcon
            title="管理员仅代管目标用户的 Token，Token 不继承管理员权限；明文回看会记录审计。"
            type="warning"
          />
        }
        pagination={{ defaultPageSize: 20 }}
        scroll={{ x: 1900 }}
        search={{ span: 8 }}
        toolBarRender={() => [
          <Permission.Access code="apitoken_admin_create" key="create">
            <AdminCreateSecretDrawer
              onCreated={(secret) => setSecretDetail(sanitizeDetail(secret))}
              onSaved={() => actionRef.current?.reload()}
            >
              <Button type="primary">代颁发秘钥</Button>
            </AdminCreateSecretDrawer>
          </Permission.Access>,
        ]}
        url="/system/apitoken/admin/page.json"
      />
      <AdminSecretModal
        detail={secretDetail}
        onClose={() => setSecretDetail(null)}
        open={!!secretDetail}
      />
    </>
  );
}
