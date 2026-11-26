/**
 * LinkBtn+Modal.confirm 的组合组件
 * 场景：比如删除时需要弹窗二次确认
 * */
// @ts-nocheck

import type { ButtonProps } from 'antd';
import { Input, Modal } from 'antd';
import { cloneElement, forwardRef, useRef } from 'react';
import type { LinkBtnProps, ModalBoxProps } from '../types';
import LinkBtn from './index';

export default forwardRef(
  (
    props: ModalBoxProps & LinkBtnProps & ButtonProps,
    ref: React.ForwardedRef<ActionRef>,
  ) => {
    const {
      remark = false,
      placeholder = '备注信息',
      method = true,
      title = '',
      content = '',
      okText = '确定',
      cancelText = '取消',
      onOk = () => {},
      modalProps = {},
      children,
      ...rest
    } = props;

    const inputRef = useRef('');

    const onConfirm = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      Modal.confirm({
        title,
        content: (
          <>
            <p>{content}</p>
            {remark && (
              <Input.TextArea
                rows={1}
                placeholder={placeholder}
                onChange={(e) => {
                  inputRef.current = e.target.value;
                }}
              />
            )}
          </>
        ),
        okText,
        cancelText,
        onOk: () => onOk(inputRef.current),
        afterClose: () => {
          inputRef.current = '';
        },
        ...modalProps,
      });
    };

    if (method) {
      return (
        <LinkBtn onClick={onConfirm} {...rest} ref={ref as any}>
          {children}
        </LinkBtn>
      );
    }

    return cloneElement(children, {
      ...rest,
      ref,
      onClick: onConfirm,
    });
  },
);
