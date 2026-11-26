import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const xmarkdownPropsMock = vi.hoisted(() => vi.fn());
const latexExtension = vi.hoisted(() => ({ name: 'latex-extension' }));

vi.mock('@ant-design/x', () => ({
  CodeHighlighter: ({ children, lang }) => (
    <div data-language={lang} data-testid="code-highlighter">
      {children}
    </div>
  ),
  Mermaid: ({ children }) => <div data-testid="mermaid">{children}</div>,
}));

vi.mock('@ant-design/x-markdown', () => ({
  XMarkdown: (props) => {
    xmarkdownPropsMock(props);
    return <div data-testid="xmarkdown">{props.content}</div>;
  },
}));

vi.mock('@ant-design/x-markdown/plugins/Latex', () => ({
  default: () => [latexExtension],
}));

import Code, {
  normalizeCodeLanguage,
  normalizeHighlightLanguage,
  shouldUsePlainCode,
} from './Code';
import Xmarkdown, { MarkdownPre } from './index';

describe('Xmarkdown code rendering', () => {
  beforeEach(() => {
    xmarkdownPropsMock.mockClear();
  });

  it('maps markdown language aliases to Prism language modules', () => {
    const markup = renderToStaticMarkup(
      <Code block lang="c++">
        {'int main() {}'}
      </Code>,
    );

    expect(markup).toContain('data-language="cpp"');
    expect(normalizeCodeLanguage({ className: 'language-objective-c' })).toBe(
      'objective-c',
    );
    expect(normalizeHighlightLanguage('objective-c')).toBe('objectivec');
    expect(normalizeHighlightLanguage('js')).toBe('javascript');
    expect(normalizeHighlightLanguage('text')).toBe('');
  });

  it('keeps mermaid on the built-in renderer', () => {
    const markup = renderToStaticMarkup(
      <Code block lang="mermaid">
        {'graph TD\nA-->B'}
      </Code>,
    );

    expect(markup).toContain('data-testid="mermaid"');
    expect(markup).not.toContain('data-testid="code-highlighter"');
  });

  it('falls back to plain code when the highlight limit is reached', () => {
    const content = Array.from(
      { length: 400 },
      (_, index) => `line-${index}`,
    ).join('\n');
    const markup = renderToStaticMarkup(
      <Code block lang="text">
        {content}
      </Code>,
    );

    expect(markup).toContain('<code');
    expect(markup).toContain('white-space:pre');
    expect(markup).not.toContain('data-testid="code-highlighter"');
    expect(
      shouldUsePlainCode({
        content,
      }),
    ).toBe(true);
  });

  it('does not count the parser-generated trailing newline', () => {
    const content399 = `${Array.from(
      { length: 399 },
      (_, index) => `line-${index}`,
    ).join('\n')}\n`;
    const content400 = `${content399}line-399\n`;

    expect(shouldUsePlainCode({ content: content399 })).toBe(false);
    expect(shouldUsePlainCode({ content: content400 })).toBe(true);
    expect(
      shouldUsePlainCode({ content: '1234\n', maxHighlightChars: 5 }),
    ).toBe(false);
    expect(
      shouldUsePlainCode({ content: '12345\n', maxHighlightChars: 5 }),
    ).toBe(true);
  });

  it('supports language renderers without replacing the default code renderer', () => {
    function CsvRenderer({ content, language }) {
      return <span data-language={language}>{content}</span>;
    }

    const markup = renderToStaticMarkup(
      <Code block codeConfig={{ renderers: { csv: CsvRenderer } }} lang="csv">
        {'name,value\nanswer,42'}
      </Code>,
    );

    expect(markup).toContain('data-language="csv"');
    expect(markup).toContain('answer,42');
    expect(markup).not.toContain('data-testid="code-highlighter"');
  });

  it('keeps inline code inline even when a renderer is registered', () => {
    const markup = renderToStaticMarkup(
      <Code codeConfig={{ renderers: { csv: () => <span>CSV</span> } }}>
        {'answer'}
      </Code>,
    );

    expect(markup).toBe('<code>answer</code>');
  });
});

describe('Xmarkdown configuration', () => {
  beforeEach(() => {
    xmarkdownPropsMock.mockClear();
  });

  it('merges class names and preserves Latex when custom extensions are used', () => {
    const customExtension = { name: 'custom-extension' };

    renderToStaticMarkup(
      <Xmarkdown
        className="custom-markdown"
        config={{ extensions: [customExtension], gfm: true }}
        content="# Title"
      />,
    );

    expect(xmarkdownPropsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        className: 'x-markdown-light custom-markdown',
        config: {
          extensions: [latexExtension, customExtension],
          gfm: true,
        },
      }),
    );
  });

  it('keeps components.code as the full override escape hatch', () => {
    function CustomCode() {
      return <span>custom code</span>;
    }

    renderToStaticMarkup(
      <Xmarkdown components={{ code: CustomCode }} content="`answer`" />,
    );

    expect(xmarkdownPropsMock.mock.lastCall[0].components.code).toBe(
      CustomCode,
    );
  });

  it('unwraps fenced code blocks from the native pre element', () => {
    const markup = renderToStaticMarkup(
      <MarkdownPre
        domNode={{
          children: [
            {
              attribs: { 'data-block': 'true' },
              name: 'code',
            },
          ],
        }}
        streamStatus="done"
      >
        <div data-testid="custom-renderer">preview</div>
      </MarkdownPre>,
    );

    expect(markup).toContain('class="x-markdown-code-block"');
    expect(markup).toContain('data-testid="custom-renderer"');
    expect(markup).not.toContain('<pre');
  });

  it('preserves ordinary pre elements', () => {
    const markup = renderToStaticMarkup(
      <MarkdownPre className="raw-pre" domNode={{ children: [] }}>
        raw content
      </MarkdownPre>,
    );

    expect(markup).toBe('<pre class="raw-pre">raw content</pre>');
  });
});
