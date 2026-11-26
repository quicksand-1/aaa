import { DrawerBox, FormSchema, request } from 'fintech';
import React, { cloneElement, useRef, useState } from 'react';
import ScopeSelector from '../_components/ScopeSelector';
import {
  buildCreateSecretFormItems,
  buildCreateSecretPayload,
} from '../_components/SecretFormSupport';

/**
 * 创建当前用户的 API Token。scope 候选加载失败时保持 fail-closed，禁止提交。
 */
export default function CreateSecretDrawer({ children, onCreated, onSaved }) {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scopeState, setScopeState] = useState({ ready: false });

  const wrappedChild = cloneElement(children, {
    onClick: (...args) => {
      children.props?.onClick?.(...args);
      drawerRef.current?.open(true);
    },
  });

  const formItems = buildCreateSecretFormItems(ScopeSelector, {
    onStateChange: setScopeState,
  });

  /** scope 值只来自后端候选项，不接受手工拼接的 URL。 */
  const createSecret = ({ form, open, values }) => {
    if (!scopeState.ready || scopeState.error) return;

    return request('/system/apitoken/create.json', {
      data: buildCreateSecretPayload(values),
      method: 'POST',
      setLoading,
    }).then((secret) => {
      onSaved?.();
      onCreated?.(secret);
      open(false);
      form.resetFields();
    });
  };

  return (
    <>
      {wrappedChild}
      <DrawerBox
        actionRef={drawerRef}
        afterOpen={({ form }) => form.resetFields()}
        confirmLoading={loading}
        form={{ layout: 'vertical' }}
        okButtonProps={{ disabled: !scopeState.ready || !!scopeState.error }}
        onOk={createSecret}
        okText="创建秘钥"
        size={520}
        title="创建秘钥"
      >
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
}
