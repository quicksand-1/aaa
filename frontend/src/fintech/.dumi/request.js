import _deepGet from 'fintech/utils/_deepGet';

export default function (url, options) {
  const {
    dataPath,
    setLoading,
    params = {},
    data,
    method = 'GET',
  } = options || {};
  // 将对象转为 query string
  const queryString = new URLSearchParams(params).toString();
  const currentUrl = queryString ? `${url}?${queryString}` : url;

  // 构建请求选项
  const fetchOptions = { ...options };

  // 处理请求体数据（非GET请求）
  if (data && method !== 'GET') {
    // 设置默认 Content-Type
    if (!fetchOptions.headers) {
      fetchOptions.headers = {};
    }
    if (!fetchOptions.headers['Content-Type']) {
      fetchOptions.headers['Content-Type'] = 'application/json';
    }
    // 序列化数据
    fetchOptions.body = typeof data === 'object' ? JSON.stringify(data) : data;
  }

  return new Promise((resolve) => {
    setLoading?.(true);
    fetch(`/m1${currentUrl}`, fetchOptions)
      .then((res) => res.json())
      .then((res) => {
        if (typeof res === 'object') {
          if (res.success) {
            resolve(
              dataPath ? _deepGet(res.dataObject, dataPath) : res.dataObject,
            );
          }
        } else {
          resolve(new Blob([res], { type: 'application/octet-stream' }));
        }
      })
      .finally(() => {
        setLoading?.(false);
      });
  });
}
