import { CopyOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Modal, message } from 'antd';
import { clipboard } from 'fintech';
import React from 'react';

/** 管理员单 Token 明文详情；关闭后的明文清理由父级负责。 */
export default function AdminSecretModal({ detail, onClose, open }) {
  const secret = detail?.accessToken || '';

  const copySecret = () => {
    clipboard.copy(secret).then(
      () => message.success('秘钥已复制'),
      () => message.error('复制失败，请手动复制秘钥'),
    );
  };

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open={open}
      title="秘钥明文"
      width={620}
    >
      <div className="flex flex-col gap-4">
        <Alert
          showIcon
          title="本次明文回看已由后端记录审计，请勿写入日志、URL 或持久化缓存。"
          type="warning"
        />
        <Descriptions
          column={1}
          items={[
            {
              key: 'user',
              label: '所属用户',
              children: detail?.userName || '-',
            },
            { key: 'account', label: '账号', children: detail?.account || '-' },
            {
              key: 'userCode',
              label: '用户编码',
              children: detail?.userCode || '-',
            },
            { key: 'org', label: '所属机构', children: detail?.orgName || '-' },
          ]}
          size="small"
        />
        <div className="flex items-start gap-2 rounded-wiki border border-wiki-border-secondary bg-wiki-bg-hover p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-sm leading-6">
            {secret || '-'}
          </code>
          <Button
            aria-label="复制秘钥"
            disabled={!secret}
            icon={<CopyOutlined />}
            onClick={copySecret}
            type="text"
          />
        </div>
      </div>
    </Modal>
  );
}
