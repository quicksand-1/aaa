import { Empty, Select, Spin } from 'antd';
import { request } from 'fintech';
import { useEffect, useRef, useState } from 'react';

/** 管理员代颁发使用的全系统启用用户选择器，不允许自由输入 userCode。 */
export default function AdminUserSelector({ onStateChange, onChange, value }) {
  const [keyword, setKeyword] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      request('/system/apitoken/admin/user-options.json', {
        method: 'GET',
        params: { currPageNo: 1, keyword, pageSize: 50 },
        showError: false,
      })
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          const users = Array.isArray(data?.datas) ? data.datas : [];
          setOptions(
            users
              .filter(
                (user) =>
                  user?.userCode &&
                  (user.status === undefined || String(user.status) === '1'),
              )
              .map((user) => ({
                label: `${user.userName || user.account || user.userCode}（${
                  user.account || user.userCode
                }）${user.orgName ? ` · ${user.orgName}` : ''}`,
                value: user.userCode,
              })),
          );
        })
        .catch((exception) => {
          if (requestId !== requestIdRef.current) return;
          setOptions([]);
          setError(exception?.errorMessage || '全系统用户加载失败');
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    onStateChange?.({ error, loading, ready: !loading && !error });
  }, [error, loading]);

  return (
    <div>
      <Select
        allowClear
        filterOption={false}
        loading={loading}
        notFoundContent={
          loading ? (
            <Spin size="small" />
          ) : (
            <Empty description="未找到启用用户" />
          )
        }
        onChange={onChange}
        onSearch={setKeyword}
        options={options}
        placeholder="搜索账号、姓名或用户编码"
        showSearch
        style={{ width: '100%' }}
        value={value}
      />
      {error ? (
        <div style={{ color: '#ff4d4f', marginTop: 8 }}>{error}</div>
      ) : null}
    </div>
  );
}
