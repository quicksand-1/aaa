import { Alert, Button, Space, Tag, message } from 'antd';
import { LinkBtn, Permission, ProTableAsync, request } from 'fintech';
import React, { useRef, useState } from 'react';
import AccessLogDrawer from '../_components/AccessLogDrawer';
import CreateSecretDrawer from './CreateSecretDrawer';
import EditSecretDrawer from './EditSecretDrawer';
import SecretModal from './SecretModal';
import TestSecretDrawer from './TestSecretDrawer';

const SECRET_STATUS_ENUM = {
  1: { text: '启用', status: 'Success' },
  2: { text: '停用', status: 'Default' },
};

function isSecretEnabled(record) {
  return String(record?.status) === '1';
}

function renderScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    return (
      <Tag
        color="warning"
        title="仍受系统全局 API Token 接口清单及用户权限约束"
      >
        Token 自身不额外限制
      </Tag>
    );
  }

  return (
    <Space size={[4, 4]} wrap>
      {scopes.map((scope, index) => (
        <Tag key={`${scope}-${index}`}>{scope}</Tag>
      ))}
    </Space>
  );
}

function renderLastUsed(record) {
  if (!record?.lastUsedTime) return '-';

  return (
    <div>
      <div>{record.lastUsedTime}</div>
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        {record.lastUsedIp || 'IP 未记录'}
      </div>
    </div>
  );
}

/** 当前登录用户的秘钥管理页。 */
export default function PersonalSecretPage() {
  const isAccess = Permission.useAccess();
  const actionRef = useRef(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationKey, setOperationKey] = useState('');
  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [secretValue, setSecretValue] = useState('');

  const showSecretDetail = (record) => {
    // 最新列表契约已经包含当前用户可回看的明文，不再调用已退出的详情接口。
    setSecretValue(record?.accessToken || '');
    setSecretModalOpen(true);
  };

  const updateSecretStatus = (record, status) => {
    const nextOperationKey = `status-${record.id}-${status}`;
    setOperationKey(nextOperationKey);
    request('/system/apitoken/status.json', {
      data: new URLSearchParams({
        status: String(status),
        tokenId: String(record.id),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      method: 'POST',
      setLoading: setOperationLoading,
    })
      .then(() => {
        message.success(status === 1 ? '秘钥已启用' : '秘钥已停用');
        actionRef.current?.reload();
      })
      .finally(() => {
        setOperationKey('');
      });
  };

  const deleteSecret = (record) => {
    const nextOperationKey = `delete-${record.id}`;
    setOperationKey(nextOperationKey);
    request('/system/apitoken/delete.json', {
      data: new URLSearchParams({ tokenId: String(record.id) }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      method: 'POST',
      setLoading: setOperationLoading,
    })
      .then(() => {
        message.success('秘钥已删除');
        actionRef.current?.reload();
      })
      .finally(() => {
        setOperationKey('');
      });
  };

  const columns = [
    {
      dataIndex: 'tokenName',
      title: '名称',
    },
    {
      dataIndex: 'status',
      title: '状态',
      valueEnum: SECRET_STATUS_ENUM,
      valueType: 'tag',
    },
    {
      dataIndex: 'scopes',
      render: renderScopes,
      title: '授权范围',
    },
    {
      dataIndex: 'expiresAt',
      renderText: (value) => value || '-',
      title: '过期时间',
    },
    {
      dataIndex: 'usageCount',
      renderText: (value) => value ?? '0',
      title: '累计调用次数',
    },
    {
      dataIndex: 'lastUsedTime',
      render: (_, record) => renderLastUsed(record),
      title: '最近使用',
    },
    {
      hideInTable: !isAccess(
        [
          'apitoken_list',
          'apitoken_edit',
          'apitoken_delete',
          'apitoken_status',
          'apitoken_access_logs',
        ],
        'some',
      ),
      render: (_, record) => [
        <Permission.Access key="detail" code="apitoken_list">
          <LinkBtn onClick={() => showSecretDetail(record)}>查看</LinkBtn>
        </Permission.Access>,
        <Permission.Access key="edit" code="apitoken_edit">
          <EditSecretDrawer
            onSaved={() => actionRef.current?.reload()}
            record={record}
          >
            <LinkBtn>编辑</LinkBtn>
          </EditSecretDrawer>
        </Permission.Access>,
        <AccessLogDrawer key="accessLogs" record={record}>
          <LinkBtn open={isAccess('apitoken_access_logs')}>调用日志</LinkBtn>
        </AccessLogDrawer>,
        <Permission.Access key="disable" code="apitoken_status">
          <LinkBtn
            color="orange"
            content="停用后，该秘钥的 Bearer 调用会立即失效，确定停用？"
            key="disable"
            loading={
              operationLoading && operationKey === `status-${record.id}-2`
            }
            onOk={() => updateSecretStatus(record, 2)}
            open={isSecretEnabled(record)}
            title="停用秘钥"
          >
            停用
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access key="enable" code="apitoken_status">
          <LinkBtn
            color="green"
            content="确定重新启用该秘钥？"
            key="enable"
            loading={
              operationLoading && operationKey === `status-${record.id}-1`
            }
            onOk={() => updateSecretStatus(record, 1)}
            open={!isSecretEnabled(record)}
            title="启用秘钥"
          >
            启用
          </LinkBtn>
        </Permission.Access>,
        <Permission.Access key="delete" code="apitoken_delete">
          <LinkBtn
            color="red"
            content="删除后无法恢复，历史调用日志仍会保留，确定删除？"
            key="delete"
            loading={operationLoading && operationKey === `delete-${record.id}`}
            onOk={() => deleteSecret(record)}
            open={!isSecretEnabled(record)}
            title="删除秘钥"
          >
            删除
          </LinkBtn>
        </Permission.Access>,
      ],
      valueType: 'option',
      width: 280,
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
            title="秘钥代表当前登录用户本人调用系统接口，最终权限仍受用户权限、Token 授权范围和系统全局 API Token 接口清单共同约束，请妥善保管。"
            type="info"
          />
        }
        pagination={false}
        search={false}
        toolBarRender={() => [
          <TestSecretDrawer key="test">
            <Button>测试秘钥</Button>
          </TestSecretDrawer>,
          <Permission.Access key="create" code="apitoken_create">
            <CreateSecretDrawer
              onCreated={(secret) => {
                setSecretValue(secret?.accessToken || '');
                setSecretModalOpen(true);
                message.success('秘钥创建成功，请妥善保存');
              }}
              onSaved={() => actionRef.current?.reload()}
            >
              <Button type="primary">创建秘钥</Button>
            </CreateSecretDrawer>
          </Permission.Access>,
        ]}
        url="/system/apitoken/list.json"
      />
      <SecretModal
        onClose={() => {
          setSecretModalOpen(false);
          setSecretValue('');
        }}
        open={secretModalOpen}
        secret={secretValue}
      />
    </>
  );
}
