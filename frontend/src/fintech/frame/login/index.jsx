import { Button, Checkbox, Form, Input } from 'antd';
import { FormSchema, genNewID, request, useCrypto } from 'fintech';
import { useState } from 'react';
import Copyright from '../components/Copyright';
import PlatformDropdown from '../components/TopRightWidget/PlatformDropdown';
import platformStorage from '../global/platformStorage';
import redirect from '../global/redirect';
import useStyles from './style';

export default () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaID, setCaptchaID] = useState(() => genNewID());
  const [encode] = useCrypto('sm2');
  const { styles } = useStyles();
  const { login = {}, copyright, logo, proxy } = platformStorage.get();

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
        remember: values.remember ? 'on' : 'off',
      },
    })
      .then(() => {
        redirect.login();
      })
      .finally(() => {
        if (!!login.captcha) {
          setCaptchaID(genNewID());
          form.setFieldsValue({ captcha: null });
        }
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.platformDropdown}>
          <PlatformDropdown />
        </div>
        <div className={styles.brand}>
          <div className={styles.brandHeader}>
            {(login.logo ?? logo) && (
              <img
                className={styles.brandLogo}
                src={login.logo ?? logo}
                alt=""
              />
            )}
            <div className={styles.brandName}>{login.name}</div>
          </div>
          <div className={styles.brandContent}>{login.description}</div>
        </div>
        <div className={styles.login}>
          <div className={styles.loginHeader}>欢迎回来，请登录您的账号</div>
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
            onFinish={handleSubmit}
          >
            <FormSchema
              items={[
                {
                  name: 'account',
                  label: '用户名',
                  inputProps: { size: 'large', allowClear: true },
                },
                {
                  name: 'password',
                  label: '密码',
                  children: (
                    <Input.Password size="large" placeholder="请输入密码" />
                  ),
                },
                {
                  open: !!login.captcha,
                  label: '验证码',
                  compact: [
                    {
                      noStyle: true,
                      name: 'captcha',
                      placeholder: '请输入验证码',
                    },
                    <img
                      key="yzm"
                      style={{ height: 38 }}
                      alt="验证码图片加载失败"
                      src={`${proxy}/captcha?${captchaID}`}
                      onClick={() => setCaptchaID(genNewID())}
                    />,
                  ],
                },
                {
                  name: 'remember',
                  required: false,
                  initialValue: true,
                  open: login.remember,
                  valuePropName: 'checked',
                  valueType: '',
                  children: <Checkbox>自动登录</Checkbox>,
                },
              ]}
            />
            <Button
              block
              size="large"
              type="primary"
              loading={loading}
              htmlType="submit"
            >
              登录系统
            </Button>
          </Form>
          <Copyright
            show={login.copyright ?? copyright}
            style={{ textAlign: 'center', fontSize: '0.9rem', paddingTop: 40 }}
          />
        </div>
      </div>
    </div>
  );
};
