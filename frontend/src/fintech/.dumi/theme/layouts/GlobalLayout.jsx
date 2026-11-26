import { BookOutlined } from '@ant-design/icons';
import { Drawer, FloatButton, Spin } from 'antd';
import { useLocation, useOutlet } from 'dumi';
import React, { lazy, Suspense, useState } from 'react';

const BooksChat = lazy(
  () => import('../../../docs/books/_components/BooksChat'),
);

const BooksAssistant = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname.startsWith('/~demos/')) {
    return null;
  }

  return (
    <>
      <FloatButton
        aria-label="打开网址助手"
        icon={<BookOutlined />}
        style={{ right: 32, bottom: 32 }}
        tooltip="网址助手"
        type="primary"
        onClick={() => setOpen(true)}
      />
      <Drawer
        closable={false}
        destroyOnHidden={false}
        open={open}
        size="75%"
        styles={{
          body: {
            overflow: 'hidden',
            padding: 0,
          },
        }}
        onClose={() => setOpen(false)}
      >
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Spin />
            </div>
          }
        >
          <BooksChat mode="drawer" />
        </Suspense>
      </Drawer>
    </>
  );
};

export default () => {
  const outlet = useOutlet();

  return (
    <>
      {outlet}
      <BooksAssistant />
    </>
  );
};
