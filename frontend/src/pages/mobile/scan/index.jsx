import { useEffect, useRef, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { history, useLocation } from '@umijs/max';
import { request } from 'fintech';

export default function MobileScanPage() {
  const location = useLocation();
  const startedRef = useRef(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ticket = new URLSearchParams(location.search).get('ticket');
    window.history.replaceState(null, document.title, '/m/scan');

    if (!ticket) {
      setStatus('error');
      setError('二维码缺少登录凭证，请重新生成');
      return;
    }

    request('/mobile/login.json', {
      method: 'POST',
      data: { ticket },
    })
      .then(() => {
        window.location.replace('/m/home');
      })
      .catch((requestError) => {
        setStatus('error');
        setError(requestError.message || '二维码已失效，请重新生成');
      });
  }, [location.search]);

  useEffect(() => {
    document.title = '手机扫码登录 - 业务工作台';
  }, []);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-slate-50 px-4 py-8">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/20">
            业
          </span>
          <Spin size="large" />
          <div>
            <h1 className="m-0 text-lg font-semibold text-slate-900">
              正在验证扫码凭证
            </h1>
            <p className="mb-0 mt-2 text-sm text-slate-500">
              请稍候，验证成功后将自动进入移动端
            </p>
          </div>
        </div>
      ) : (
        <Result
          extra={[
            <Button
              key="login"
              type="primary"
              onClick={() => history.replace('/login')}
            >
              返回登录
            </Button>,
          ]}
          status="error"
          subTitle={error}
          title="无法进入工作台"
        />
      )}
    </main>
  );
}
