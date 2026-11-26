import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const xmarkdownPropsMock = vi.hoisted(() => vi.fn());

vi.mock('../Xmarkdown', () => ({
  default: (props) => {
    xmarkdownPropsMock(props);
    return <div data-testid="xmarkdown">{props.content}</div>;
  },
}));

import MessageContent from './MessageContent';

describe('MessageContent markdown rendering', () => {
  beforeEach(() => {
    xmarkdownPropsMock.mockClear();
  });

  it('renders string content through Xmarkdown', () => {
    renderToStaticMarkup(<MessageContent item={{ content: 'hello' }} />);

    expect(xmarkdownPropsMock.mock.lastCall[0].content).toBe('hello');
  });

  it('forwards markdownProps to Xmarkdown so callers can customize rendering', () => {
    const dompurifyConfig = {
      ALLOWED_URI_REGEXP: /^(?:atrust):/i,
    };

    renderToStaticMarkup(
      <MessageContent
        item={{ content: '[vpn](atrust://)' }}
        markdownProps={{ dompurifyConfig, openLinksInNewTab: true }}
      />,
    );

    expect(xmarkdownPropsMock.mock.lastCall[0].dompurifyConfig).toBe(
      dompurifyConfig,
    );
    expect(xmarkdownPropsMock.mock.lastCall[0].openLinksInNewTab).toBe(true);
  });

  it('does not inject any business-specific markdown configuration by default', () => {
    renderToStaticMarkup(<MessageContent item={{ content: 'hello' }} />);

    expect(xmarkdownPropsMock.mock.lastCall[0].dompurifyConfig).toBeUndefined();
  });
});
