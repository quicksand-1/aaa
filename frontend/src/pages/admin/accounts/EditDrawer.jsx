import { cloneElement, useRef, useState } from 'react';
import { Checkbox, Divider, Form, message } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';
import { PERMISSION_MODULES, REGEXP } from '@/constants';

const MODULES = PERMISSION_MODULES;
const ROLES = ['管理员', '编辑员', '查看员', '自定义'];

const PASSWORD_MESSAGE =
  '密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位';

function buildPermissions(role) {
  const permissions = {};
  MODULES.forEach(({ key }) => {
    permissions[key] = {
      read: true,
      edit: role === '管理员' || role === '编辑员',
      download: role === '管理员',
    };
  });
  return permissions;
}

function emptyPermissions() {
  const permissions = {};
  MODULES.forEach(({ key }) => {
    permissions[key] = { read: false, edit: false, download: false };
  });
  return permissions;
}

export default function EditDrawer({ data, onSaved, children }) {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!data;
  const [adminMode, setAdminMode] = useState(!!data?.isAdmin);

  const applyRole = (role) => {
    const form = drawerRef.current?.form;
    if (role === '自定义') {
      setAdminMode(false);
      form?.setFieldsValue({ isAdmin: false });
      return;
    }

    const permissions = buildPermissions(role);
    const isAdmin = role === '管理员';
    setAdminMode(isAdmin);
    form?.setFieldsValue({ permissions, isAdmin });
  };

  return (
    <>
      {cloneElement(children, {
        onClick: () => drawerRef.current?.open(true),
      })}
      <DrawerBox
        form
        size={720}
        actionRef={drawerRef}
        confirmLoading={loading}
        title={isEdit ? '编辑账号' : '新增账号'}
        afterOpen={({ form }) => {
          if (!data) {
            form.setFieldsValue({
              role: '查看员',
              isAdmin: false,
              status: true,
              permissions: buildPermissions('查看员'),
            });
            return;
          }

          form.setFieldsValue({
            ...data,
            permissions: data.permissions || emptyPermissions(),
          });
        }}
        onOk={({ values, open }) => {
          const id = data?.id;
          const payload = {
            ...values,
            status: values.status !== false,
          };

          request(id ? `/users/${id}` : '/users', {
            method: id ? 'PUT' : 'POST',
            data: payload,
            setLoading,
          }).then(() => {
            message.success('保存成功');
            open(false);
            onSaved?.();
          });
        }}
      >
        <FormSchema
          unique="id"
          items={[
            {
              name: 'username',
              label: '登录账号',
              required: !isEdit,
              inputProps: {
                maxLength: 30,
                disabled: isEdit,
                // 阻止浏览器自动填充保存过的账号
                autoComplete: 'off',
              },
              rules: {
                pattern: REGEXP.USERNAME,
                message: '只能包含英文、数字、下划线，长度 3-30 位',
              },
            },
            {
              name: 'name',
              label: '姓名/备注',
              required: true,
              rules: { max: 50, message: '姓名/备注不能超过 50 个字符' },
            },
            {
              name: 'role',
              label: '角色模板',
              required: true,
              valueType: 'select',
              valueEnum: ROLES.reduce((result, role) => {
                result[role] = role;
                return result;
              }, {}),
              inputProps: { onChange: applyRole },
            },
            {
              open: !isEdit,
              name: 'password',
              label: '初始密码',
              valueType: 'password',
              required: !isEdit,
              inputProps: {
                maxLength: 18,
                // 阻止浏览器自动填充密码
                autoComplete: 'new-password',
              },
              rules: {
                pattern: REGEXP.PASSWORD,
                message: PASSWORD_MESSAGE,
              },
            },
            {
              name: 'isAdmin',
              label: '管理员权限',
              required: false,
              valueType: 'switch',
              inputProps: {
                onChange: (checked) => {
                  setAdminMode(checked);
                  const form = drawerRef.current?.form;
                  if (!form) return;

                  if (checked) {
                    form.setFieldsValue({
                      role: '管理员',
                      permissions: buildPermissions('管理员'),
                    });
                  } else if (form.getFieldValue('role') === '管理员') {
                    // 管理员身份关闭后不能继续保留“管理员”角色，否则后端仍会按管理员模板处理
                    form.setFieldsValue({ role: '自定义' });
                  }
                },
              },
            },
            {
              open: isEdit,
              name: 'status',
              label: '账号状态',
              required: false,
              valueType: 'switch',
              inputProps: {
                checkedChildren: '启用',
                unCheckedChildren: '停用',
              },
            },
          ]}
        />

        {MODULES.length > 0 ? (
          <>
            <Divider titlePlacement="start">模块权限</Divider>
            <div>
              {MODULES.map((module) => (
                <div
                  key={module.key}
                  className="mb-3 flex items-center justify-between gap-4 border-b border-gray-100 pb-3"
                >
                  <span className="w-56 text-sm">{module.label}</span>
                  <div className="flex gap-6">
                    <Form.Item
                      noStyle
                      name={['permissions', module.key, 'read']}
                      valuePropName="checked"
                    >
                      <Checkbox disabled={adminMode}>阅读</Checkbox>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      name={['permissions', module.key, 'edit']}
                      valuePropName="checked"
                    >
                      <Checkbox disabled={adminMode}>修改</Checkbox>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      name={['permissions', module.key, 'download']}
                      valuePropName="checked"
                    >
                      <Checkbox disabled={adminMode}>下载</Checkbox>
                    </Form.Item>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </DrawerBox>
    </>
  );
}
