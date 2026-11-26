import { Button, ConfigProvider, Input } from 'antd';
import { Form, FormSchema, genNewID, request, useCrypto } from 'fintech';
import { useEffect, useState } from 'react';
import Copyright from 'frame/components/Copyright';
import PlatformDropdown from 'frame/components/TopRightWidget/PlatformDropdown';
import platformStorage from 'frame/global/platformStorage';
import redirect from 'frame/global/redirect';

const MOBILE_LOGIN_PATH = '/m/home';
const DESKTOP_LOGIN_PATH = '/info';

const BrandMark = ({ logo, compact = false }) => (
  <span
    className={`grid shrink-0 place-items-center overflow-hidden font-black ${
      compact
        ? 'h-11 w-11 rounded-xl bg-blue-600 text-lg text-white shadow-sm'
        : 'h-14 w-14 rounded-[16px] bg-white text-[22px] text-[#1677ff] shadow-[0_14px_32px_rgba(0,21,41,0.28)]'
    }`}
  >
    {logo ? (
      <img
        className={
          compact ? 'h-8 w-8 object-contain' : 'h-10 w-10 object-contain'
        }
        src={logo}
        alt=""
      />
    ) : (
      '业'
    )}
  </span>
);

function isMobileLogin() {
  return (
    window.matchMedia('(max-width: 767px)').matches ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaID, setCaptchaID] = useState(() => genNewID());
  const [encode] = useCrypto('sm2');
  const { login = {}, copyright, name, logo, proxy } = platformStorage.get();

  const brandName = login.name || name || '业务工作台';
  const brandDescription = login.description || '通用业务管理平台';

  useEffect(() => {
    document.title = `登录 - ${brandName}`;
  }, [brandName]);

  const handleSubmit = ({ account, password, ...values }) => {
    request('/login.json', {
      setLoading,
      method: 'POST',
      data: {
        ...values,
        account: login.crypto ? encode(account, login.crypto, true) : account,
        password: login.crypto
          ? encode(password, login.crypto, true)
          : password,
      },
    })
      .then(() => {
        const savedPath = redirect.get()?.path;
        redirect.set({
          path:
            savedPath ||
            (isMobileLogin() ? MOBILE_LOGIN_PATH : DESKTOP_LOGIN_PATH),
          desc: '登录成功',
          type: 'login',
        });
        redirect.login();
      })
      .finally(() => {
        if (login.captcha) {
          setCaptchaID(genNewID());
          form.setFieldsValue({ captcha: null });
        }
      });
  };

  return (
    <main className="min-h-[100dvh] bg-[#f8fafc] font-sans text-slate-900 lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1.06fr)_minmax(480px,0.94fr)]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(22,119,255,0.32),transparent_34%),radial-gradient(circle_at_84%_76%,rgba(64,150,255,0.24),transparent_38%),linear-gradient(145deg,#001529_0%,#003a8c_52%,#0958d9_100%)] px-[clamp(40px,5vw,72px)] py-[clamp(32px,4vw,64px)] text-white lg:flex">
        <div className="pointer-events-none absolute -bottom-[150px] -right-[110px] h-[420px] w-[420px] rounded-full border border-white/10 shadow-[0_0_0_58px_rgba(255,255,255,0.035),0_0_0_116px_rgba(255,255,255,0.025)]" />

        <div className="relative z-10 flex items-center gap-3.5">
          <BrandMark logo={login.logo ?? logo} />
          <div className="grid gap-0.5">
            <strong className="text-[21px] leading-tight">{brandName}</strong>
            <span className="text-[10px] font-bold tracking-[0.14em] text-white/65">
              BUSINESS DESK
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-[650px] py-20">
          <span className="inline-flex rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-[#91caff]">
            BUSINESS WORKSPACE
          </span>
          <h1 className="mb-5 mt-6 max-w-[620px] text-[clamp(34px,4vw,56px)] font-bold leading-[1.18] tracking-[-0.035em]">
            {brandDescription}
          </h1>
          <p className="m-0 max-w-[570px] text-base leading-8 text-white/70">
            统一承载业务数据与流程，按需接入页面、接口和权限，快速搭建新的业务应用。
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          业务数据协同 · 安全访问
        </div>
      </section>

      <section className="relative flex min-h-[100dvh] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-6 lg:min-h-screen lg:justify-center lg:p-[clamp(32px,4vw,64px)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_15%_0%,rgba(22,119,255,0.16),transparent_55%),linear-gradient(180deg,#eff6ff_0%,rgba(248,250,252,0)_100%)] lg:hidden" />
        <div className="absolute right-4 top-3 z-10 hidden lg:block lg:right-6 lg:top-5">
          <PlatformDropdown />
        </div>

        <header className="login-mobile-header relative z-10 flex items-center justify-between pb-5 pt-1 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark compact logo={login.logo ?? logo} />
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {brandName}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-slate-500">
                {brandDescription}
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-blue-100 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-blue-700">
            安全登录
          </span>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center lg:block lg:flex-none">
          <div className="login-card grid w-full max-w-[420px] gap-4 rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6 lg:max-w-[460px] lg:gap-6 lg:rounded-[20px] lg:border-[#d9e2ec]/90 lg:p-[38px] lg:shadow-[0_24px_70px_rgba(22,119,255,0.12)]">
            <header>
              <span className="text-xs font-semibold text-blue-600">
                欢迎回来
              </span>
              <h1 className="mb-2 mt-1.5 text-[24px] font-bold leading-tight text-slate-900 lg:text-[28px]">
                登录{brandName}
              </h1>
              <p className="m-0 text-sm leading-6 text-slate-600">
                请使用企业授权账号进入工作台
              </p>
            </header>

            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#1677ff',
                  colorPrimaryHover: '#4096ff',
                  colorPrimaryActive: '#0958d9',
                  colorText: '#0f172a',
                  colorTextSecondary: '#475569',
                  colorBorder: '#cbd5e1',
                  borderRadius: 8,
                  controlHeight: 44,
                  controlHeightLG: 46,
                  fontSize: 14,
                },
                components: {
                  Input: {
                    hoverBorderColor: '#4096ff',
                    activeBorderColor: '#1677ff',
                    activeShadow: '0 0 0 2px rgba(22, 119, 255, 0.12)',
                  },
                  Button: {
                    primaryShadow: 'none',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <Form
                className="login-form"
                form={form}
                layout="vertical"
                requiredMark="optional"
                onFinish={handleSubmit}
              >
                <FormSchema
                  items={[
                    {
                      name: 'account',
                      label: '账号',
                      inputProps: {
                        size: 'large',
                        allowClear: true,
                        autoComplete: 'username',
                        autoCapitalize: 'none',
                        autoCorrect: 'off',
                        enterKeyHint: 'next',
                        placeholder: '请输入企业账号',
                      },
                    },
                    {
                      name: 'password',
                      label: '密码',
                      children: (
                        <Input.Password
                          size="large"
                          autoComplete="current-password"
                          autoCapitalize="none"
                          enterKeyHint="done"
                          placeholder="请输入密码"
                        />
                      ),
                    },
                    {
                      open: !!login.captcha,
                      label: '验证码',
                      compact: [
                        {
                          noStyle: true,
                          name: 'captcha',
                          inputProps: {
                            autoComplete: 'off',
                            placeholder: '请输入验证码',
                          },
                        },
                        <button
                          key="captcha"
                          aria-label="刷新验证码"
                          className="h-[46px] shrink-0 cursor-pointer overflow-hidden rounded-r-lg border border-l-0 border-slate-300 bg-white transition-colors duration-200 hover:border-[#4096ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677ff] motion-reduce:transition-none"
                          title="点击刷新验证码"
                          type="button"
                          onClick={() => setCaptchaID(genNewID())}
                        >
                          <img
                            className="h-full w-auto min-w-[96px] object-cover"
                            alt="验证码，点击可刷新"
                            src={`${proxy}/captcha?${captchaID}`}
                          />
                        </button>,
                      ],
                    },
                  ]}
                />

                <Button
                  block
                  className="min-h-12"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  type="primary"
                >
                  登录系统
                </Button>
              </Form>
            </ConfigProvider>

            <footer className="border-t border-slate-100 pt-4 text-center text-xs leading-5 text-slate-500">
              <div>内部系统 · 仅限授权账号访问</div>
              <Copyright
                show={login.copyright ?? copyright}
                style={{
                  fontSize: 12,
                  lineHeight: 1.7,
                  padding: 0,
                }}
              />
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
