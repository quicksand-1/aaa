/**
 * 返回数据可自定义，默认是 dataObject
 * @PS：当 responseType=blob 时，表示是文件流下载
 * */
import localConfig from '../localConfig';

export default (url: string, options?: any) => {
  const { request } = localConfig.newInstance();

  return request(url, options);
};
