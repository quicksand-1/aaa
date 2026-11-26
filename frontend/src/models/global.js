/**
 * 全局状态管理
 * */
import { useState, useCallback } from 'react';

export default () => {
  const [globalState, setData] = useState({
    sessionId: '',
    datasetId: '',
  });

  const setData2 = useCallback(
    (values = {}) => {
      setData((pre) => ({
        ...pre,
        ...values,
      }));
    },
    [globalState]
  );

  return { globalState, setGlobalState: setData2 };
};
