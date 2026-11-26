/**
 * iframe 中间件渲染，根据不同的 key 渲染不同的路由页面
 * @API
 *   data<Record>: 工单列表中的数据内容
 * */

import { useRef } from 'react';
import DrawerBox from '../DrawerBox';
import LinkBtn from '../LinkBtn';
import storage from './storage';

export default ({ data = {}, actionRef }: any) => {
  const drawerRef = useRef(null);

  return (
    <>
      <LinkBtn
        onClick={() => {
          storage.set(data);
          drawerRef.current?.open(true);
        }}
      >
        详情
      </LinkBtn>
      <DrawerBox
        size="98%"
        closeIcon={null}
        actionRef={drawerRef}
        afterClose={() => {
          actionRef.current?.reload();
        }}
      >
        <div className="h-[calc(100dvh-55px)] bg-slate-100">
          <iframe
            src={`/ticket/${data.businessType}`}
            className="h-full w-full border-0 bg-white"
          />
        </div>
      </DrawerBox>
    </>
  );
};
