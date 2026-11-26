/*
业务系统代码 app.tsx 中添加如下代码
import { Copyright, PlatformContext } from 'frame/components';

export function rootContainer(container: React.ReactNode) {
  return (
    <PlatformContext.Provider
      value={platformStorage.get()}
    >
      {container}
    </PlatformContext.Provider>
  );
}

实际业务中使用如下代码
import { usePlatformContext } from 'frame/components';

const { apps, app } = usePlatformContext();
const loginConfig = usePlatformContext('login');
*/

import { createContext, useContext } from 'react';

export const PlatformContext = createContext(null);

export function usePlatformContext(key) {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatformContext must be used within PlatformProvider');
  }
  return !!key ? ctx[key] : ctx;
}
