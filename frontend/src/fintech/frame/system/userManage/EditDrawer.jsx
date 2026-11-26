import { message, TreeSelect } from 'antd';
import { DrawerBox, FormSchema, regexp, request, SelectList } from 'fintech';
import { cloneElement, useRef, useState } from 'react';

export default (props) => {
  const { children, data, actionRef, ...rest } = props;

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [deptData, setDeptData] = useState([]);

  const wrappedChild = cloneElement(children, {
    ...rest,
    onClick: () => {
      drawerRef.current?.open(true);
    },
  });

  return (
    <>
      {wrappedChild}
      <DrawerBox
        form
        actionRef={drawerRef}
        confirmLoading={loading}
        title={data ? '用户编辑' : '用户新增'}
        onOk={({ values, open }) => {
          request(
            values.userCode
              ? '/system/user/edit.json'
              : '/system/user/add.json',
            {
              setLoading,
              method: 'POST',
              data: {
                ...values,
                modifiedPwdPeriodSign: Number(!!values.modifiedPwdPeriodSign),
              },
            },
          ).then(() => {
            open(false);
            actionRef.current?.reload();
            message.success('保存成功');
          });
        }}
        afterOpen={() => {
          // 部门
          request('/system/org/tree/select.json').then((res) => {
            setDeptData(res);
          });
          if (data) {
            drawerRef.current?.form.setFieldsValue({
              ...data,
              roleCodes: JSON.parse(data.roleCodes),
              modifiedPwdPeriodSign: !!data.modifiedPwdPeriodSign,
            });
          }
        }}
      >
        <FormSchema
          unique="userCode"
          items={[
            { name: 'account', label: '账号' },
            { name: 'userName', label: '姓名' },
            {
              open: !data?.userCode,
              name: 'password',
              label: '密码',
              rules: {
                pattern: regexp.PASSWORD,
                message:
                  '新密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位',
              },
            },
            {
              open: !data?.userCode,
              name: 'confirmPassword',
              label: '确认密码',
              validateFirst: true,
              rules: {
                validator: (_, value) => {
                  if (
                    value !== drawerRef.current?.form.getFieldValue('password')
                  ) {
                    return Promise.reject(
                      new Error('两次密码不一致，请重新输入'),
                    );
                  }
                  return Promise.resolve();
                },
              },
            },
            {
              name: 'pertainCode',
              label: '部门',
              children: <TreeSelect treeData={deptData} treeDefaultExpandAll />,
            },
            {
              name: 'roleCodes',
              label: '角色',
              children: (
                <SelectList
                  mode="multiple"
                  fields={['key', 'label']}
                  url="/system/role/tree.json"
                />
              ),
            },
            { name: 'phone', label: '手机号', required: false },
            {
              name: 'email',
              label: '邮箱',
              required: false,
              rules: [{ type: 'email', message: '请输入正确格式的邮箱' }],
            },
            { name: 'description', label: '备注', required: false },
            {
              name: 'modifiedPwdPeriodSign',
              label: '定期修改密码',
              valueType: 'switch',
              required: false,
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
