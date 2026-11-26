import { CopyOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, message } from 'antd';
import { clipboard, request } from 'fintech';
import React, { useEffect, useState } from 'react';
import {
  buildMcpAgentConfigText,
  validateMcpClientConfig,
} from './mcpAgentConfig';

/** 展示秘钥明文，并提供秘钥和外部 Agent MCP 配置的复制能力。 */
export default function SecretModal({ onClose, open, secret }) {
  const [mcpClientConfig, setMcpClientConfig] = useState(null);
  const [mcpClientConfigError, setMcpClientConfigError] = useState('');
  const [mcpClientConfigLoading, setMcpClientConfigLoading] = useState(false);

  const loadMcpClientConfig = () => {
    setMcpClientConfigError('');
    request('/mcp/client-config', {
      method: 'GET',
      setLoading: setMcpClientConfigLoading,
      showError: false,
    })
      .then(validateMcpClientConfig)
      .then(setMcpClientConfig)
      .catch((error) => {
        setMcpClientConfig(null);
        setMcpClientConfigError(error?.message || 'MCP 连接信息加载失败');
      });
  };

  useEffect(() => {
    if (open && !mcpClientConfig && !mcpClientConfigLoading) {
      loadMcpClientConfig();
    }
  }, [open]);

  const copySecret = () => {
    clipboard.copy(secret).then(
      () => {
        // 复制成功后不关闭弹窗，方便用户确认已保存。
        message.success('秘钥已复制');
      },
      () => {
        message.error('复制失败，请手动复制秘钥');
      },
    );
  };

  const copyAgentConfig = () => {
    if (!mcpClientConfig) {
      message.error(
        mcpClientConfigLoading
          ? 'MCP 连接信息正在加载，请稍后重试'
          : 'MCP 连接信息加载失败，请重试',
      );
      return;
    }

    clipboard.copy(buildMcpAgentConfigText(mcpClientConfig, secret)).then(
      () => {
        message.success('Agent 配置已复制');
      },
      () => {
        message.error('Agent 配置复制失败，请重试');
      },
    );
  };

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open={open}
      title="秘钥明文"
      width={560}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert
          showIcon
          title="请妥善保存秘钥。它等同于当前账号的调用凭证，请勿分享给他人。"
          type="warning"
        />
        {mcpClientConfigError ? (
          <Alert
            action={
              <Button onClick={loadMcpClientConfig} size="small">
                重试
              </Button>
            }
            description="无法生成可用的外部 Agent 配置。"
            showIcon
            title={mcpClientConfigError}
            type="error"
          />
        ) : null}
        <div
          style={{
            alignItems: 'flex-start',
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            display: 'flex',
            gap: 8,
            padding: 12,
          }}
        >
          <code
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: 14,
              lineHeight: 1.7,
              minWidth: 0,
              overflowWrap: 'anywhere',
            }}
          >
            {secret || '-'}
          </code>
          <Button
            aria-label="复制秘钥"
            icon={<CopyOutlined />}
            onClick={copySecret}
            type="text"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button block icon={<CopyOutlined />} onClick={copySecret}>
            复制秘钥
          </Button>
          <Button
            block
            disabled={!mcpClientConfig}
            icon={<CopyOutlined />}
            loading={mcpClientConfigLoading}
            onClick={copyAgentConfig}
          >
            复制 Agent 配置
          </Button>
        </div>
      </div>
    </Modal>
  );
}
