import { CloseOutlined } from '@ant-design/icons';
import { Empty, Select, Spin, Tag } from 'antd';
import { request } from 'fintech';
import React, { useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 200;

function normalizeOptions(data) {
  const options = Array.isArray(data?.datas) ? data.datas : [];
  return options
    .filter((item) => item?.scopeCode)
    .map((item) => ({
      label: (
        <span>
          <Tag color="blue">{String(item.method || '').toUpperCase()}</Tag>
          {item.name || item.menuCode || item.scopeCode}
          <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
            {item.url || ''}
          </span>
        </span>
      ),
      searchText: [item.name, item.menuCode, item.url, item.scopeCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      value: item.scopeCode,
    }));
}

/**
 * 只允许选择后端注册的 scopeCode；候选接口不可用时保持 fail-closed。
 * historicalValues 用于回显已经从全局清单下线的旧 scope，并强制用户移除。
 */
export default function ScopeSelector({
  historicalValues = [],
  onStateChange,
  value = [],
  onChange,
}) {
  const [keyword, setKeyword] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false);
  const knownOptionsRef = useRef(new Map());
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      request('/system/apitoken/scope-options.json', {
        method: 'GET',
        params: { currPageNo: 1, keyword, pageSize: PAGE_SIZE },
        showError: false,
      })
        .then((data) => {
          if (requestId !== requestIdRef.current) return;
          const nextOptions = normalizeOptions(data);
          nextOptions.forEach((item) =>
            knownOptionsRef.current.set(item.value, item),
          );
          setOptions([...knownOptionsRef.current.values()]);
          if (!keyword) setInitialLoaded(true);
        })
        .catch((exception) => {
          if (requestId !== requestIdRef.current) return;
          setOptions([...knownOptionsRef.current.values()]);
          setError(exception?.errorMessage || '接口授权范围加载失败');
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  const optionMap = knownOptionsRef.current;
  const invalidValues = initialLoaded
    ? (historicalValues || []).filter(
        (item) => item && value.includes(item) && !optionMap.has(item),
      )
    : [];
  useEffect(() => {
    onStateChange?.({
      error,
      invalidValues,
      loading,
      options,
      ready: initialLoaded && !loading,
    });
  }, [error, initialLoaded, invalidValues.join('|'), loading, options]);

  return (
    <div>
      <Select
        allowClear
        mode="multiple"
        notFoundContent={
          loading ? <Spin size="small" /> : <Empty description="暂无可选接口" />
        }
        onChange={onChange}
        onSearch={setKeyword}
        options={options}
        placeholder="搜索菜单名称、编码或 URL"
        showSearch
        style={{ width: '100%' }}
        tagRender={({ closable, label, onClose, value: itemValue }) => {
          const invalid = invalidValues.includes(itemValue);
          return (
            <Tag
              color={invalid ? 'error' : undefined}
              closable={closable}
              closeIcon={<CloseOutlined />}
              onClose={onClose}
              style={{ marginInlineEnd: 4 }}
            >
              {invalid ? '已失效 · ' : ''}
              {label || itemValue}
            </Tag>
          );
        }}
        value={value}
        filterOption={(input, option) =>
          option?.searchText?.includes(input.toLowerCase()) ||
          String(option?.value || '')
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
      {error ? (
        <div style={{ color: '#ff4d4f', marginTop: 8 }}>{error}</div>
      ) : null}
      {!error && !loading && options.length === 0 ? (
        <div style={{ color: '#8c8c8c', marginTop: 8 }}>
          系统暂未开放 API Token 接口
        </div>
      ) : null}
      {invalidValues.length > 0 ? (
        <div style={{ color: '#d46b08', marginTop: 8 }}>
          已失效 scope 必须移除后才能保存。
        </div>
      ) : null}
    </div>
  );
}
