import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import SecretModal from './SecretModal';

const { copyMock, messageErrorMock, messageSuccessMock, requestMock } =
  vi.hoisted(() => ({
    copyMock: vi.fn(),
    messageErrorMock: vi.fn(),
    messageSuccessMock: vi.fn(),
    requestMock: vi.fn(),
  }));

const mcpClientConfig = {
  serverName: 'enterprise-wiki-test',
  type: 'streamable-http',
  url: 'https://mcp.example.test/mcp',
};

vi.mock('@ant-design/icons', () => ({
  CopyOutlined: () => <span>copy</span>,
}));

vi.mock('antd', () => ({
  Alert: ({ action, description, title }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
      {action}
    </div>
  ),
  Button: ({
    'aria-label': ariaLabel,
    children,
    disabled,
    icon,
    loading,
    onClick,
  }) => (
    <button
      aria-busy={loading}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {children}
    </button>
  ),
  Modal: ({ children, open, title }) =>
    open ? (
      <div>
        <div>{title}</div>
        {children}
      </div>
    ) : null,
  message: {
    error: messageErrorMock,
    success: messageSuccessMock,
  },
}));

vi.mock('fintech', () => ({
  clipboard: {
    copy: copyMock,
  },
  request: requestMock,
}));

describe('SecretModal', () => {
  beforeEach(() => {
    copyMock.mockReset();
    copyMock.mockResolvedValue(undefined);
    messageErrorMock.mockClear();
    messageSuccessMock.mockClear();
    requestMock.mockReset();
    requestMock.mockResolvedValue(mcpClientConfig);
  });

  test('preloads backend metadata when opened and copies a usable Agent config', async () => {
    render(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    expect(requestMock).toHaveBeenCalledWith('/mcp/client-config', {
      method: 'GET',
      setLoading: expect.any(Function),
      showError: false,
    });

    const copyAgentButton = screen.getByRole('button', {
      name: /复制 Agent 配置/,
    });
    await waitFor(() => expect(copyAgentButton).toBeEnabled());
    fireEvent.click(copyAgentButton);

    await waitFor(() => {
      expect(copyMock).toHaveBeenCalledTimes(1);
      expect(messageSuccessMock).toHaveBeenCalledWith('Agent 配置已复制');
    });
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(copyMock.mock.calls[0][0])).toEqual({
      mcpServers: {
        'enterprise-wiki-test': {
          type: 'streamable-http',
          url: 'https://mcp.example.test/mcp',
          headers: {
            Authorization: 'Bearer gs_at_test_token',
          },
          disabled: false,
        },
      },
    });
  });

  test('does not request metadata before the modal opens', () => {
    render(
      <SecretModal onClose={() => {}} open={false} secret="gs_at_test_token" />,
    );

    expect(requestMock).not.toHaveBeenCalled();
  });

  test('caches loaded metadata across modal reopenings', async () => {
    const { rerender } = render(
      <SecretModal onClose={() => {}} open secret="gs_at_test_token" />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /复制 Agent 配置/ }),
      ).toBeEnabled(),
    );
    rerender(
      <SecretModal onClose={() => {}} open={false} secret="gs_at_test_token" />,
    );
    rerender(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  test('disables Agent config copying while metadata is loading', async () => {
    let resolveRequest;
    requestMock.mockImplementation((_url, { setLoading }) => {
      setLoading(true);
      return new Promise((resolve) => {
        resolveRequest = (value) => {
          setLoading(false);
          resolve(value);
        };
      });
    });
    render(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    const copyAgentButton = screen.getByRole('button', {
      name: /复制 Agent 配置/,
    });
    await waitFor(() =>
      expect(copyAgentButton).toHaveAttribute('aria-busy', 'true'),
    );
    expect(copyAgentButton).toBeDisabled();
    fireEvent.click(copyAgentButton);
    expect(copyMock).not.toHaveBeenCalled();

    await act(async () => resolveRequest(mcpClientConfig));
  });

  test('keeps copying disabled after load failure and supports retry', async () => {
    requestMock
      .mockRejectedValueOnce(new Error('MCP 服务地址不可用'))
      .mockResolvedValueOnce(mcpClientConfig);
    render(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    expect(await screen.findByText('MCP 服务地址不可用')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /复制 Agent 配置/ }),
    ).toBeDisabled();
    expect(copyMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '重试' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /复制 Agent 配置/ }),
      ).toBeEnabled(),
    );
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  test('rejects incomplete metadata without exposing an invalid config', async () => {
    requestMock.mockResolvedValueOnce({
      serverName: 'enterprise-wiki-test',
      type: 'streamable-http',
      url: '',
    });
    render(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    expect(
      await screen.findByText('MCP 客户端配置响应不完整'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /复制 Agent 配置/ }),
    ).toBeDisabled();
    expect(copyMock).not.toHaveBeenCalled();
  });

  test('keeps the existing direct secret copy action', async () => {
    render(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    fireEvent.click(screen.getByText('复制秘钥').closest('button'));

    await waitFor(() => {
      expect(copyMock).toHaveBeenCalledWith('gs_at_test_token');
      expect(messageSuccessMock).toHaveBeenCalledWith('秘钥已复制');
    });
  });

  test('shows an error when copying the Agent config fails', async () => {
    copyMock.mockRejectedValueOnce(new Error('clipboard unavailable'));
    render(<SecretModal onClose={() => {}} open secret="gs_at_test_token" />);

    const copyAgentButton = screen.getByRole('button', {
      name: /复制 Agent 配置/,
    });
    await waitFor(() => expect(copyAgentButton).toBeEnabled());
    fireEvent.click(copyAgentButton);

    await waitFor(() => {
      expect(messageErrorMock).toHaveBeenCalledWith(
        'Agent 配置复制失败，请重试',
      );
    });
  });
});
