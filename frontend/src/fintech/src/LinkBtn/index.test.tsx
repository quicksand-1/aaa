import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@umijs/max', () => ({
  Link: () => null,
}));

vi.mock('antd', () => ({
  Button: () => null,
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./confirm', () => ({
  default: () => null,
}));

vi.mock('../utils/storageSQL', () => ({
  default: vi.fn(),
}));

import storageSQL from '../utils/storageSQL';
import LinkBtn from './index';

describe('LinkBtn href branch', () => {
  beforeEach(() => {
    vi.mocked(storageSQL).mockReturnValue({});
  });

  it('renders a native anchor with standard link attributes', () => {
    const markup = renderToStaticMarkup(
      <LinkBtn
        aria-label="download report"
        className="download-link"
        download="report.zip"
        href="/reports/1"
      >
        Download
      </LinkBtn>,
    );

    expect(markup).toBe(
      '<a href="/reports/1" aria-label="download report" class="download-link" download="report.zip">Download</a>',
    );
  });

  it('prepends the current platform proxy to a local href', () => {
    vi.mocked(storageSQL).mockReturnValue({ proxy: '/credit/' });

    const markup = renderToStaticMarkup(
      <LinkBtn href="/reports/1">Download</LinkBtn>,
    );

    expect(markup).toBe('<a href="/credit/reports/1">Download</a>');
  });

  it('does not prepend the proxy to an absolute href', () => {
    vi.mocked(storageSQL).mockReturnValue({ proxy: '/credit' });

    const markup = renderToStaticMarkup(
      <LinkBtn href="https://example.com/report.zip">Download</LinkBtn>,
    );

    expect(markup).toBe(
      '<a href="https://example.com/report.zip">Download</a>',
    );
  });
});
