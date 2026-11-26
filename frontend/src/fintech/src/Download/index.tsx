/**
 * 文件流下载，一般都是后端接口下载模版文件
 * @params
 *   url：请求接口，如果有参数，则也在此添加
 *   filename：文件名
 * */

import { cloneElement, useState } from 'react';
import fileController from '../utils/fileController';

export default (props: any) => {
  const { children, url, filename, ...rest } = props;

  const [loading, setLoading] = useState(false);

  const wrappedChild = cloneElement(children, {
    ...rest,
    loading,
    onClick: () => {
      fileController.downloadBlob({ url, filename, setLoading });
    },
  });

  return wrappedChild;
};
