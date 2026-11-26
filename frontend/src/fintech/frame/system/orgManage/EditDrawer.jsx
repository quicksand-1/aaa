import { useModel } from '@umijs/max';
import { message } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';
import { cloneElement, useRef, useState } from 'react';

export default (props) => {
  const { children, data, actionRef, ...rest } = props;
  const { initialState } = useModel('@@initialState');

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
        title={data ? '编辑' : '新增'}
        onOk={({ values, open }) => {
          request('/org/addOrUpdate.json', {
            setLoading,
            method: 'POST',
            data: values,
          }).then(() => {
            open(false);
            actionRef.current?.reload();
            message.success('保存成功');
          });
        }}
        afterOpen={({ form }) => {
          if (data) {
            request('/org/get.json', {
              setLoading,
              params: { orgCode: data.orgCode },
            }).then((res) => {
              form.setFieldsValue({
                ...res,
                orgType: res.orgType?.code,
              });
            });
          }
        }}
      >
        <FormSchema
          items={[
            {
              name: 'orgCode',
              label: '参与方编码',
              rules: [
                { pattern: /^((?!-{2,}).)+$/, message: '不支持--字符' },
                {
                  pattern: /^[^\u4e00-\u9fa5!@#$%^&*\s]+$/,
                  message: '不支持中文、空格、!@#$%^&*等字符',
                },
              ],
              disabled: !!data,
            },
            { name: 'orgName', label: '参与方全称' },
            { name: 'orgAbbreviation', label: '参与方简称' },
            {
              name: 'orgType',
              label: '参与方类型',
              valueType: 'select',
              valueEnum: { AST: '资产机构', ABS: '管理机构' },
              tooltip:
                '类型为“资产机构”，则会按机构编码同步数据；类型为“管理机构”，则不会同步',
              initialValue: 'ABS',
            },
            {
              open: !data,
              name: 'pertainCode',
              label: '归属部门',
              valueType: 'select',
              valueEnum: initialState.currentUser?.scopeDept,
              inputProps: {
                localSearch: true,
                fields: ['code', 'name'],
              },
            },
            '联系人',
            { name: 'linkmanName', label: '姓名', required: false },
            {
              name: 'linkmanPhone',
              label: '手机号',
              required: false,
              rules: {
                pattern: /^((1[3-8][0-9])\d{8})$/,
                message: '请填写正确格式的手机号',
              },
            },
            {
              name: 'linkmanEmail',
              label: '邮箱',
              required: false,
              rules: { type: 'email' },
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
