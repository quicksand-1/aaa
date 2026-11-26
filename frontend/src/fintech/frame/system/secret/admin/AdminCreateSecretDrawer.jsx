import { DrawerBox, FormSchema, request } from 'fintech';
import React, { cloneElement, createElement, useRef, useState } from 'react';
import ScopeSelector from '../_components/ScopeSelector';
import {
  buildCreateSecretFormItems,
  buildCreateSecretPayload,
} from '../_components/SecretFormSupport';
import AdminUserSelector from './AdminUserSelector';

/** 管理员为全系统启用用户代颁发 Token。 */
export default function AdminCreateSecretDrawer({
  children,
  onCreated,
  onSaved,
}) {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scopeState, setScopeState] = useState({ ready: false });
  const [userState, setUserState] = useState({ ready: false });

  const trigger = cloneElement(children, {
    onClick: (...args) => {
      children.props?.onClick?.(...args);
      drawerRef.current?.open(true);
    },
  });

  const formItems = [
    {
      children: createElement(AdminUserSelector, {
        onStateChange: setUserState,
      }),
      label: '目标用户',
      name: 'userCode',
      rules: [{ message: '请选择启用用户', required: true }],
    },
    ...buildCreateSecretFormItems(ScopeSelector, {
      onStateChange: setScopeState,
    }),
  ];
  const disabled =
    !scopeState.ready ||
    !!scopeState.error ||
    !userState.ready ||
    !!userState.error;

  return (
    <>
      {trigger}
      <DrawerBox
        actionRef={drawerRef}
        afterOpen={({ form }) => form.resetFields()}
        confirmLoading={loading}
        form={{ layout: 'vertical' }}
        okButtonProps={{ disabled }}
        okText="代颁发"
        onOk={({ form, open, values }) => {
          if (disabled) return;
          request('/system/apitoken/admin/create.json', {
            data: {
              ...buildCreateSecretPayload(values),
              userCode: values.userCode,
            },
            method: 'POST',
            setLoading,
          }).then((secret) => {
            onSaved?.();
            onCreated?.(secret);
            open(false);
            form.resetFields();
          });
        }}
        size={560}
        title="管理员代颁发秘钥"
      >
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
}
