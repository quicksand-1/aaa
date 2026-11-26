import { Button, Drawer, Form, Modal, Spin } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import ActionsContainer from '../ActionsContainer';
import type { ModalBoxProps } from '../types';

type CancelType = 'close' | 'cancel';

const DrawerBox = (props: ModalBoxProps) => {
  const {
    actionRef,
    form,
    formReset = true,
    confirm,
    okText = '确定',
    cancelText = '取消',
    onOk,
    onCancel,
    afterOpen,
    afterClose,
    confirmLoading = false,
    okButtonProps = {},
    cancelButtonProps = {},
    footer = ['cancel', 'ok'],
    ...rest
  } = props;

  const [formInstance] = Form.useForm();
  const [open, setOpen] = useState(false);

  // 公共方法，在 onOk 等执行函数中可能会用到
  const eventProps = {
    open: setOpen,
    form: formInstance,
  };

  // 提供给外部的接口
  useImperativeHandle(actionRef, () => eventProps);

  const ok = () => {
    if (!onOk) {
      return setOpen(false);
    }

    if (form) {
      formInstance.validateFields().then((res: any) => {
        // 二次确认是否存在
        if (confirm) {
          Modal.confirm({
            title: '操作确认',
            content: confirm,
            onOk: onOk.bind(null, { values: res, ...eventProps }),
          });
        } else {
          onOk({ values: res, ...eventProps });
        }
      });
      return;
    }

    if (confirm) {
      Modal.confirm({
        title: '操作确认',
        content: confirm,
        onOk: onOk.bind(null, eventProps),
      });
      return;
    }

    onOk(eventProps);
  };

  const cancel = (type: CancelType) => {
    if (onCancel) {
      onCancel({ type, ...eventProps });
      return;
    }
    setOpen(false);
  };

  return (
    <Drawer
      size={500}
      open={open}
      destroyOnHidden
      placement="right"
      onClose={(e) => {
        e.stopPropagation();
        cancel('close');
      }}
      afterOpenChange={(v) => {
        // 打开时
        if (v) {
          afterOpen?.(eventProps);
        } else {
          // 关闭时
          afterClose?.(eventProps);
          if (formReset && form) {
            formInstance.resetFields();
          }
        }
      }}
      extra={
        <ActionsContainer
          actions={footer}
          defaultActions={{
            ok: (
              <Button
                type="primary"
                onClick={ok}
                loading={confirmLoading}
                {...okButtonProps}
              >
                {okText}
              </Button>
            ),
            cancel: (
              <Button
                onClick={cancel.bind(null, 'cancel')}
                {...cancelButtonProps}
              >
                {cancelText}
              </Button>
            ),
          }}
        />
      }
      {...rest}
      onClick={(e) => {
        // 消除浮层点击后冒泡造成的上层组件事件的触发
        e.stopPropagation();
      }}
    >
      <Spin spinning={confirmLoading}>
        {form ? (
          <Form {...(typeof form === 'object' ? form : {})} form={formInstance}>
            {rest.children}
          </Form>
        ) : (
          rest.children
        )}
      </Spin>
    </Drawer>
  );
};

export default DrawerBox;
