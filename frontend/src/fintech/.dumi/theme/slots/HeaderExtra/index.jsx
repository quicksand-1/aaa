import { ReactComponent as IconHistory } from '@ant-design/icons-svg/inline-svg/outlined/history.svg';
import { Link, useLocation } from 'dumi';
import React from 'react';
import './style.less';

export default function HeaderExtra() {
  const { pathname } = useLocation();
  const active = pathname === '/changelog';

  return (
    <Link
      aria-label="更新日志"
      aria-current={active ? 'page' : undefined}
      className="fintech-header-changelog"
      data-active={active || undefined}
      data-dumi-tooltip="更新日志"
      data-dumi-tooltip-bottom
      to="/changelog"
    >
      <IconHistory />
    </Link>
  );
}
