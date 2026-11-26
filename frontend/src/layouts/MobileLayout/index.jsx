import { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { history, Outlet, useLocation, useModel } from '@umijs/max';
import platformStorage from 'frame/global/platformStorage';
import MobileChangePassword from '@/components/MobileChangePassword';

const TABS = [
  { key: 'home', label: '首页', path: '/m/home' },
  { key: 'chat', label: '对话', path: '/m/chat' },
  { key: 'modules', label: '模块', path: '/m/modules' },
  { key: 'profile', label: '我的', path: '/m/profile' },
];

const PAGE_TITLES = {
  '/m/profile/password': '修改密码',
};

export default function MobileLayout() {
  const location = useLocation();
  const contentRef = useRef(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { name } = platformStorage.get();
  const currentUser = initialState?.currentUser;

  const activeTab =
    TABS.find((item) => location.pathname.startsWith(item.path)) || TABS[0];
  const isTabPage = TABS.some((item) => item.path === location.pathname);
  const isChatPage = location.pathname === '/m/chat';
  const pageTitle = isTabPage
    ? activeTab.label
    : PAGE_TITLES[location.pathname] || '一屏宏观';

  useEffect(() => {
    document.title = `${pageTitle} - ${name}`;
    contentRef.current?.scrollTo({ top: 0 });
  }, [location.pathname, name, pageTitle]);

  return (
    <div className="h-[100dvh] min-h-[100dvh] bg-slate-200">
      <div
        className={`mobile-shell mx-auto grid h-full max-w-[520px] overflow-hidden bg-slate-50 shadow-2xl ${
          isChatPage
            ? 'grid-rows-[minmax(0,1fr)_auto]'
            : 'grid-rows-[auto_minmax(0,1fr)_auto]'
        }`}
      >
        {!isChatPage ? (
          <header
            className="z-20 border-b border-slate-200 bg-white/95 backdrop-blur"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="relative flex h-14 items-center justify-between px-3">
              <div className="flex w-11 justify-start">
                {isTabPage ? (
                  <span aria-hidden="true" className="h-8 w-8" />
                ) : (
                  <button
                    aria-label="返回"
                    className="grid h-11 w-11 -translate-x-2 place-items-center rounded-full text-slate-700 active:bg-slate-100"
                    type="button"
                    onClick={() => {
                      if (window.history.length > 1) {
                        history.back();
                      } else {
                        history.push('/m/home');
                      }
                    }}
                  >
                    <LeftOutlined />
                  </button>
                )}
              </div>

              <h1 className="pointer-events-none absolute left-1/2 m-0 -translate-x-1/2 truncate text-base font-semibold text-slate-900">
                {pageTitle}
              </h1>

              <div aria-hidden="true" className="h-11 w-11 shrink-0" />
            </div>
          </header>
        ) : null}

        <main
          ref={contentRef}
          className={
            isChatPage
              ? 'min-h-0 overflow-hidden'
              : 'mobile-scroll min-h-0 overflow-y-auto overscroll-contain'
          }
        >
          <Outlet />
        </main>

        <nav
          className="z-20 border-t border-slate-200 bg-white/95 backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="grid h-16 grid-cols-4">
            {TABS.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.key}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 transition-colors ${
                    active ? 'text-brand-600' : 'text-slate-400'
                  }`}
                  type="button"
                  onClick={() => history.push(item.path)}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <Modal
        centered
        closable={false}
        destroyOnHidden
        footer={null}
        keyboard={false}
        mask={{ closable: false }}
        open={!!currentUser?.needModifiedPwd}
        title="请先修改密码"
        width="min(420px, calc(100vw - 32px))"
      >
        <p className="mb-5 mt-2 text-sm text-slate-500">
          当前账号为首次登录或密码已被重置，完成修改后才能继续使用。
        </p>
        <MobileChangePassword
          onSuccess={() => {
            setInitialState((previous) => ({
              ...previous,
              currentUser: {
                ...previous?.currentUser,
                needModifiedPwd: false,
              },
            }));
          }}
        />
      </Modal>
    </div>
  );
}
