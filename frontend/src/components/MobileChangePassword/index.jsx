import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { request } from 'fintech';
import { REGEXP } from '@/constants';

const PASSWORD_MESSAGE =
  '密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位';

export default function MobileChangePassword({ onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={(values) => {
        request('/system/user/changePwd.json', {
          method: 'POST',
          data: values,
          setLoading,
        }).then(() => {
          message.success('修改成功');
          form.resetFields();
          onSuccess?.();
        });
      }}
    >
      <Form.Item
        name="oldPwd"
        label="原密码"
        rules={[{ required: true, message: '请输入原密码' }]}
      >
        <Input.Password
          autoComplete="current-password"
          placeholder="请输入原密码"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="newPwd"
        label="新密码"
        rules={[
          { required: true, message: '请输入新密码' },
          { pattern: REGEXP.PASSWORD, message: PASSWORD_MESSAGE },
        ]}
      >
        <Input.Password
          autoComplete="new-password"
          maxLength={18}
          placeholder="请输入新密码"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="rePwd"
        label="确认新密码"
        dependencies={['newPwd']}
        rules={[
          { required: true, message: '请再次输入新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPwd') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password
          autoComplete="new-password"
          maxLength={18}
          placeholder="请再次输入新密码"
          size="large"
        />
      </Form.Item>
      <Button
        block
        htmlType="submit"
        loading={loading}
        size="large"
        type="primary"
      >
        确认修改
      </Button>
    </Form>
  );
}
