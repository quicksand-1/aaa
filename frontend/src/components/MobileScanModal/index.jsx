import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Modal, QRCode, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { request } from 'fintech';

function formatRemaining(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

export default function MobileScanModal({ open, onClose }) {
  const [ticket, setTicket] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTicket = useCallback(() => {
    setLoading(true);
    setError('');
    request('/mobile/session-ticket.json', {
      method: 'POST',
      data: {},
      setLoading,
    })
      .then((data) => {
        setTicket(data.ticket);
        setBaseUrl(data.baseUrl || window.location.origin);
        setExpiresAt(Date.now() + data.expiresInSeconds * 1000);
        setRemaining(data.expiresInSeconds);
      })
      .catch((requestError) => {
        setTicket('');
        setBaseUrl('');
        setExpiresAt(0);
        setRemaining(0);
        setError(requestError.message || '二维码生成失败');
      });
  }, []);

  useEffect(() => {
    if (open) {
      loadTicket();
      return;
    }

    setTicket('');
    setBaseUrl('');
    setExpiresAt(0);
    setRemaining(0);
    setError('');
  }, [loadTicket, open]);

  useEffect(() => {
    if (!expiresAt) return undefined;

    const update = () => {
      setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const qrValue = ticket
    ? `${baseUrl || window.location.origin}/m/scan?ticket=${encodeURIComponent(
        ticket
      )}`
    : '';
  const qrHostname = qrValue ? new URL(qrValue).hostname : '';
  const isLocalhost = ['localhost', '127.0.0.1'].includes(qrHostname);
  const expired = !!ticket && remaining === 0;

  return (
    <Modal
      destroyOnHidden
      footer={null}
      onCancel={onClose}
      open={open}
      title="手机扫码进入"
      width={420}
    >
      <div className="flex flex-col items-center pt-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <QRCode
            bordered={false}
            onRefresh={loadTicket}
            size={216}
            status={loading ? 'loading' : expired ? 'expired' : 'active'}
            value={qrValue || '-'}
          />
        </div>

        {error ? (
          <Alert
            className="mt-4 w-full"
            message={error}
            showIcon
            type="error"
          />
        ) : (
          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-slate-800">
              {expired
                ? '二维码已过期'
                : `有效期 ${formatRemaining(remaining)}`}
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              使用手机扫码后会自动登录并进入移动端首页
            </div>
          </div>
        )}

        {isLocalhost ? (
          <Alert
            className="mt-4 w-full"
            message="当前未获取到可用的局域网地址，请使用局域网 IP 或线上域名打开系统后再生成二维码。"
            showIcon
            type="warning"
          />
        ) : null}

        <Alert
          className="mt-3 w-full"
          message="二维码包含一次性登录凭证，2 分钟内有效且只能使用一次，请勿转发给他人。"
          showIcon
          type="info"
        />

        {qrValue ? (
          <Typography.Text
            className="mt-3 max-w-full text-xs text-slate-500"
            copyable={{ text: qrValue }}
            ellipsis
          >
            {qrValue}
          </Typography.Text>
        ) : null}

        <Button
          block
          className="mt-4"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={loadTicket}
        >
          刷新二维码
        </Button>
      </div>
    </Modal>
  );
}
