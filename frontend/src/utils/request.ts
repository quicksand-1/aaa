/**
 * 兼容 data / dataObject 两种后端包裹格式。
 * @PS：当 responseType=blob 时，表示是文件流下载
 * */
import { request } from '@umijs/max';
// @ts-ignore
import _deepGet from 'fintech/utils/_deepGet';

interface CommonResponse<T> {
  success: boolean;
  data?: T;
  dataObject?: T;
  code?: string;
  errorCode?: string;
  message?: string;
  errorMessage?: string;
}

function resolveResponseData<T>(res: CommonResponse<T>) {
  if ('data' in res) {
    return res.data;
  }
  return res.dataObject;
}

function resolveResponseErrorMessage(res: CommonResponse<unknown>) {
  return (
    res.message || res.errorMessage || res.code || res.errorCode || '请求失败'
  );
}

const requestFun = <T = any>(url: string, options?: Record<any, any>) => {
  const { dataPath, setLoading } = options || {};
  setLoading?.(true);
  return request<CommonResponse<T>>(url, options || {})
    .then((res) => {
      if (options?.responseType === 'blob') {
        return res;
      }

      if (res.success) {
        const data = resolveResponseData(res);
        return dataPath ? _deepGet(data, dataPath) : data;
      }
      return Promise.reject(new Error(resolveResponseErrorMessage(res)));
    })
    .finally(() => {
      setLoading?.(false);
    });
};

export default requestFun;
