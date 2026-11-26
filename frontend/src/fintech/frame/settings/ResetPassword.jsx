import { Button, Input, message } from 'antd';
import { Form, FormSchema, regexp, request } from 'fintech';
import { useState } from 'react';

export default ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  return (
    <Form
      form={form}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={(values) => {
        request('/system/user/changePwd.json', {
          method: 'POST',
          setLoading,
          data: values,
        }).then(() => {
          message.success('修改成功');
          form.resetFields();
          onSuccess?.();
        });
      }}
    >
      <FormSchema
        colSpan={15}
        items={[
          {
            name: 'oldPwd',
            label: '原密码',
            children: <Input.Password placeholder="请输入原密码" />,
          },
          {
            name: 'newPwd',
            label: '新的密码',
            rules: {
              pattern: regexp.PASSWORD,
              message:
                '新密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位',
            },
            children: (
              <Input.Password placeholder="请输入新密码" maxLength={18} />
            ),
          },
          {
            name: 'rePwd',
            label: '确认密码',
            rules: {
              validator: (_, value) => {
                if (value !== form.getFieldValue('newPwd')) {
                  return Promise.reject(
                    new Error('两次密码不一致，请重新输入'),
                  );
                }
                return Promise.resolve();
              },
            },
            children: <Input.Password placeholder="请输入确认密码" />,
          },
          {
            wrapperCol: { offset: 8, span: 16 },
            children: (
              <Button htmlType="submit" type="primary" loading={loading}>
                提交
              </Button>
            ),
          },
        ]}
      />
    </Form>
  );
};
