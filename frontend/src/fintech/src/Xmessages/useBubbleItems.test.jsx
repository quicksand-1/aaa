import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const messageContentPropsMock = vi.hoisted(() => vi.fn());

vi.mock('./MessageContent', () => ({
  default: (props) => {
    messageContentPropsMock(props);
    return <div data-testid="message-content" />;
  },
}));

import useBubbleItems from './useBubbleItems';

function Harness({ options }) {
  const bubbleItems = useBubbleItems(options);

  return <>{bubbleItems[0]?.content}</>;
}

describe('useBubbleItems markdownProps', () => {
  it('passes markdownProps down to every MessageContent', () => {
    const markdownProps = {
      dompurifyConfig: { ALLOWED_URI_REGEXP: /^(?:atrust):/i },
    };

    renderToStaticMarkup(
      <Harness
        options={{
          items: [{ key: '1', role: 'ai', content: 'hello' }],
          renderers: {},
          markdownProps,
        }}
      />,
    );

    expect(messageContentPropsMock.mock.lastCall[0].markdownProps).toBe(
      markdownProps,
    );
  });
});
