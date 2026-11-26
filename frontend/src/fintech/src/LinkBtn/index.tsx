import { Link } from '@umijs/max';
import { Button, Tooltip } from 'antd';
import React, { forwardRef, useCallback, useMemo } from 'react';
import type { LinkBtnProps } from '../types';
import storageSQL from '../utils/storageSQL';
import Confirm from './confirm';

const ABSOLUTE_HREF_REGEXP = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

const prependProxy = (href: string, proxy?: string) => {
  if (!proxy || ABSOLUTE_HREF_REGEXP.test(href)) {
    return href;
  }

  const normalizedProxy = proxy.replace(/\/+$/, '');

  if (href === normalizedProxy || href.startsWith(`${normalizedProxy}/`)) {
    return href;
  }

  return `${normalizedProxy}/${href.replace(/^\/+/, '')}`;
};

const LinkBtn = forwardRef<HTMLButtonElement | HTMLAnchorElement, LinkBtnProps>(
  (props, ref) => {
    const {
      variant = 'link',
      color = 'primary',
      to,
      href,
      open = true,
      loading = false,
      tooltip,
      tooltipProps,
      ...rest
    } = props;

    const style = useMemo(() => {
      if (variant === 'link') {
        return { padding: 0 };
      }
    }, [variant]);

    const wrapWithTooltip = useCallback(
      (component: React.ReactNode) => {
        if (tooltip) {
          return (
            <Tooltip title={tooltip} {...tooltipProps}>
              {component}
            </Tooltip>
          );
        }
        return component;
      },
      [tooltip, tooltipProps],
    );

    if (!open) return null;

    if (to) {
      return wrapWithTooltip(<Link to={to} ref={ref as any} {...rest} />);
    }

    if (href) {
      // platformStorage.get() 读取的也是 sys=env 这条平台配置。
      const proxy = storageSQL('find', { where: 'sys=env' })?.proxy;

      return wrapWithTooltip(
        <a
          href={prependProxy(href, proxy)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...rest}
        />,
      );
    }

    if (rest.onOk) {
      return wrapWithTooltip(<Confirm {...(props as any)} ref={ref} />);
    }

    const button = (
      <Button
        ref={ref as React.Ref<HTMLButtonElement>}
        variant={variant}
        color={color as any}
        loading={loading}
        {...rest}
        style={{ ...style, ...rest.style }}
      >
        {rest.children}
      </Button>
    );

    return wrapWithTooltip(button);
  },
);

export default LinkBtn;
