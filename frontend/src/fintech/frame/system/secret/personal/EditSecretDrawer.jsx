import { DrawerBox, FormSchema, request } from 'fintech';
import React, { cloneElement, useRef, useState } from 'react';
import ScopeSelector from '../_components/ScopeSelector';
import {
  buildEditSecretFormItems,
  buildEditSecretInitialValues,
  buildEditSecretPayload,
} from '../_components/SecretFormSupport';

/** 编辑当前用户已有 API Token 的可变元数据，不读取或修改 Token 明文。 */
export default function EditSecretDrawer({ children, onSaved, record }) {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scopeState, setScopeState] = useState({ ready: false });

  const wrappedChild = cloneElement(children, {
    onClick: (...args) => {
      children.props?.onClick?.(...args);
      drawerRef.current?.open(true);
    },
  });

  const formItems = buildEditSecretFormItems(ScopeSelector, {
    historicalValues: record?.scopes,
    onStateChange: setScopeState,
  });

  /** 全量提交可变元数据；失效 scope 未移除时禁止保存。 */
  const editSecret = ({ form, open, values }) => {
    if (
      !scopeState.ready ||
      scopeState.error ||
      scopeState.invalidValues?.length > 0
    ) {
      return;
    }

    return request('/system/apitoken/edit.json', {
      data: buildEditSecretPayload(record, values),
      method: 'POST',
      setLoading,
    }).then((updatedSecret) => {
      onSaved?.(updatedSecret);
      open(false);
      form.resetFields();
    });
  };

  return (
    <>
      {wrappedChild}
      <DrawerBox
        actionRef={drawerRef}
        afterOpen={({ form }) => {
          form.resetFields();
          form.setFieldsValue(buildEditSecretInitialValues(record));
        }}
        confirmLoading={loading}
        form={{ layout: 'vertical' }}
        okButtonProps={{
          disabled:
            !scopeState.ready ||
            !!scopeState.error ||
            scopeState.invalidValues?.length > 0,
        }}
        okText="保存"
        onOk={editSecret}
        size={520}
        title="编辑秘钥"
      >
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
}
