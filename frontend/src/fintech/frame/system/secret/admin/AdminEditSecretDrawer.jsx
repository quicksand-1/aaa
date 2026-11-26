import { Alert, Descriptions } from 'antd';
import { DrawerBox, FormSchema, request } from 'fintech';
import React, { cloneElement, useRef, useState } from 'react';
import ScopeSelector from '../_components/ScopeSelector';
import {
  buildEditSecretFormItems,
  buildEditSecretInitialValues,
  buildEditSecretPayload,
} from '../_components/SecretFormSupport';

/** 管理员编辑 Token 元数据；忽略详情响应中的明文，不允许修改归属字段。 */
export default function AdminEditSecretDrawer({ children, onSaved, record }) {
  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [scopeState, setScopeState] = useState({ ready: false });

  const trigger = cloneElement(children, {
    onClick: (...args) => {
      children.props?.onClick?.(...args);
      drawerRef.current?.open(true);
    },
  });
  const formItems = buildEditSecretFormItems(ScopeSelector, {
    historicalValues: detail?.scopes,
    onStateChange: setScopeState,
  });
  const disabled =
    !detail ||
    !!detailError ||
    !scopeState.ready ||
    !!scopeState.error ||
    scopeState.invalidValues?.length > 0;

  return (
    <>
      {trigger}
      <DrawerBox
        actionRef={drawerRef}
        afterClose={() => {
          setDetail(null);
          setDetailError('');
          setScopeState({ ready: false });
        }}
        afterOpen={({ form }) => {
          setDetail(null);
          setDetailError('');
          form.resetFields();
          request('/system/apitoken/admin/detail.json', {
            method: 'GET',
            params: { tokenId: record.id },
            setLoading,
          })
            .then((response) => {
              const safeDetail = Object.fromEntries(
                Object.entries(response || {}).filter(
                  ([key]) =>
                    !['accessToken', 'tokenCiphertext', 'tokenHash'].includes(
                      key,
                    ),
                ),
              );
              setDetail(safeDetail);
              form.setFieldsValue(buildEditSecretInitialValues(safeDetail));
            })
            .catch((exception) => {
              setDetailError(exception?.errorMessage || '秘钥详情加载失败');
            });
        }}
        confirmLoading={loading}
        form={{ layout: 'vertical' }}
        okButtonProps={{ disabled }}
        okText="保存"
        onOk={({ form, open, values }) => {
          if (disabled) return;
          request('/system/apitoken/admin/edit.json', {
            data: buildEditSecretPayload(record, values),
            method: 'POST',
            setLoading,
          }).then(() => {
            onSaved?.();
            open(false);
            form.resetFields();
          });
        }}
        size={560}
        title="编辑秘钥"
      >
        {detailError ? (
          <Alert className="mb-4" showIcon title={detailError} type="error" />
        ) : null}
        <Descriptions
          className="mb-4"
          column={1}
          items={[
            {
              key: 'user',
              label: '所属用户',
              children: detail?.userName || record?.userName || '-',
            },
            {
              key: 'account',
              label: '账号',
              children: detail?.account || record?.account || '-',
            },
            {
              key: 'org',
              label: '所属机构',
              children: detail?.orgName || record?.orgName || '-',
            },
          ]}
          size="small"
        />
        <FormSchema items={formItems} />
      </DrawerBox>
    </>
  );
}
