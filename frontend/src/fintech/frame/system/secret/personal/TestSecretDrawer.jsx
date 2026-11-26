import { Alert, message } from 'antd';
import { DrawerBox, FormSchema } from 'fintech';
import React, { cloneElement, useRef, useState } from 'react';

function formatResponseBody(responseText) {
  if (!responseText) return '（响应体为空）';

  try {
    return JSON.stringify(JSON.parse(responseText), null, 2);
  } catch {
    return responseText;
  }
}

function isBusinessSuccess(responseText) {
  if (!responseText) return true;

  try {
    return JSON.parse(responseText)?.success !== false;
  } catch {
    return true;
  }
}

function formatResultTitle(result) {
  if (result.error) return '请求未完成';

  const statusText = result.statusText ? ` ${result.statusText}` : '';
  return `${result.ok ? '请求成功' : '请求未通过'} · HTTP ${
    result.status
  }${statusText}`;
}

/** 使用浏览器原生 fetch 验证 API Token 是否可以访问指定 GET 接口。 */
export default function TestSecretDrawer({ children }) {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const wrappedChild = cloneElement(children, {
    onClick: (...args) => {
      children.props?.onClick?.(...args);
      drawerRef.current?.open(true);
    },
  });

  const testSecret = ({ values }) => {
    const url = String(values.url || '').trim();
    const token = String(values.token || '').trim();

    setLoading(true);
    setResult(null);

    return fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
    })
      .then((response) =>
        response.text().then((responseText) => {
          setResult({
            body: formatResponseBody(responseText),
            ok: response.ok && isBusinessSuccess(responseText),
            status: response.status,
            statusText: response.statusText,
          });
        }),
      )
      .catch((error) => {
        const errorMessage = error?.message || '未知网络错误';
        setResult({ error: errorMessage, ok: false });
        message.error('请求失败，请检查 URL、网络连接和 CORS 配置');
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {wrappedChild}
      <DrawerBox
        actionRef={drawerRef}
        afterOpen={({ form }) => {
          form.resetFields();
          setResult(null);
        }}
        cancelText="关闭"
        confirmLoading={loading}
        form={{ autoComplete: 'off', layout: 'vertical' }}
        okText="发起 GET 请求"
        onOk={testSecret}
        size={640}
        title="测试 API Token"
      >
        <Alert
          className="mb-4"
          description={
            <div>
              <div>
                请求头格式：<code>Authorization: Bearer &lt;API Token&gt;</code>
              </div>
              <div>
                Bearer 与 Token 之间必须保留一个空格；下方输入框只需填写 Token
                本身，无需填写 Bearer。
              </div>
              <div>
                请求直接从当前浏览器发出且不携带登录 Cookie。请只填写受信任的
                URL；跨域请求需要目标服务允许 CORS。
              </div>
            </div>
          }
          showIcon
          title="Token 将通过 Bearer Authorization 请求头发送"
          type="warning"
        />
        <FormSchema
          items={[
            {
              inputProps: { autoComplete: 'off' },
              label: '请求 URL',
              name: 'url',
              rules: [
                {
                  message: '请输入以 http:// 或 https:// 开头的完整 URL',
                  pattern: /^https?:\/\/\S+$/i,
                  required: true,
                },
              ],
            },
            {
              inputProps: { autoComplete: 'new-password' },
              label: 'API Token',
              name: 'token',
              rules: [
                {
                  message: '请输入 API Token',
                  required: true,
                  whitespace: true,
                },
              ],
              valueType: 'password',
            },
          ]}
        />
        {result && (
          <Alert
            className="mt-4"
            description={
              <div>
                {result.error ? (
                  <div className="break-words">{result.error}</div>
                ) : (
                  <pre className="m-0 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-wiki bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-50">
                    {result.body}
                  </pre>
                )}
              </div>
            }
            showIcon
            title={formatResultTitle(result)}
            type={result.ok ? 'success' : 'error'}
          />
        )}
      </DrawerBox>
    </>
  );
}
