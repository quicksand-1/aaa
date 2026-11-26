import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { request } from 'fintech';
import { REGEXP } from '@/constants';

const PASSWORD_MESSAGE =
  '密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位';

const ResetPasswordModal = forwardRef(({ onSaved }, ref) => {
  const [form] = Form.useForm();
  const userRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  useImperativeHandle(ref, () => ({
    open(user) {
      userRef.current = user;
      form.resetFields();
      setPassword('');
      setOpen(true);
    },
  }));

  return (
    <Modal
      open={open}
      title={`重置密码：${userRef.current?.username || ''}`}
      confirmLoading={loading}
      onCancel={() => setOpen(false)}
      onOk={() => {
        form.validateFields().then((values) => {
          request(`/users/${userRef.current.id}/password`, {
            method: 'PUT',
            data: { password: values.password },
            setLoading,
          }).then(() => {
            message.success('密码已重置，该账号下次登录必须修改密码');
            setOpen(false);
            onSaved?.();
          });
        });
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="password"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            {
              pattern: REGEXP.PASSWORD,
              message: PASSWORD_MESSAGE,
            },
          ]}
        >
          <Input.Password
            placeholder="请输入新密码"
            maxLength={18}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="rePassword"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            {
              validator: (_, value) =>
                value === password
                  ? Promise.resolve()
                  : Promise.reject(new Error('两次密码不一致')),
            },
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" maxLength={18} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default ResetPasswordModal;
