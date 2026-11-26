import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import SecretPage from './index';

const { accessMock } = vi.hoisted(() => ({
  accessMock: vi.fn(),
}));

vi.mock('fintech', () => ({
  MagicTabs: ({ items }) => (
    <div>
      {items
        .filter((item) => item.open)
        .map((item) => (
          <section key={item.key}>
            <h2>{item.label}</h2>
            {item.children}
          </section>
        ))}
    </div>
  ),
  Permission: {
    useAccess: () => accessMock,
  },
}));

vi.mock('./personal', () => ({
  default: () => <div>personal-secret-page</div>,
}));

vi.mock('./admin', () => ({
  default: () => <div>admin-secret-page</div>,
}));

describe('SecretPage', () => {
  beforeEach(() => {
    accessMock.mockReset();
    accessMock.mockImplementation((code) => code === 'apitoken_mgr');
  });

  test('groups personal and admin management under separate permissioned tabs', () => {
    render(<SecretPage />);

    expect(screen.getByRole('heading', { name: '我的' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '全局管理' }),
    ).not.toBeInTheDocument();
    expect(accessMock).toHaveBeenNthCalledWith(1, 'apitoken_mgr');
    expect(accessMock).toHaveBeenNthCalledWith(2, 'apitoken_admin_mgr');
  });

  test('shows the administrator tab only with the independent admin permission', () => {
    accessMock.mockReturnValue(true);
    render(<SecretPage />);

    expect(screen.getByRole('heading', { name: '我的' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '全局管理' }),
    ).toBeInTheDocument();
  });
});
