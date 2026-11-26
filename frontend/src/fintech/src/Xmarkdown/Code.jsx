import { CodeHighlighter, Mermaid } from '@ant-design/x';
import React from 'react';

export const DEFAULT_MAX_HIGHLIGHT_CHARS = 20000;
export const DEFAULT_MAX_HIGHLIGHT_LINES = 400;

const HIGHLIGHT_LANGUAGE_ALIASES = {
  'c#': 'csharp',
  'c++': 'cpp',
  'f#': 'fsharp',
  'objective-c': 'objectivec',
  cjs: 'javascript',
  golang: 'go',
  html: 'markup',
  js: 'javascript',
  kt: 'kotlin',
  md: 'markdown',
  mjs: 'javascript',
  objc: 'objectivec',
  ps1: 'powershell',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  shell: 'bash',
  ts: 'typescript',
  txt: '',
  xml: 'markup',
  yml: 'yaml',
  zsh: 'bash',
};
const PLAIN_CODE_LANGUAGES = new Set(['none', 'plain', 'plaintext', 'text']);

export function normalizeCodeContent(children) {
  if (typeof children === 'string') {
    return children;
  }

  if (Array.isArray(children)) {
    return children
      .filter((child) => typeof child === 'string' || typeof child === 'number')
      .join('');
  }

  if (typeof children === 'number') {
    return String(children);
  }

  return '';
}

export function normalizeCodeLanguage({ className, lang } = {}) {
  const infoString =
    typeof lang === 'string'
      ? lang
      : className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] || '';

  return infoString.trim().split(/\s+/)[0]?.toLowerCase() || '';
}

export function normalizeHighlightLanguage(language) {
  if (!language || PLAIN_CODE_LANGUAGES.has(language)) {
    return '';
  }

  return HIGHLIGHT_LANGUAGE_ALIASES[language] ?? language;
}

export function shouldUsePlainCode({
  content,
  maxHighlightChars = DEFAULT_MAX_HIGHLIGHT_CHARS,
  maxHighlightLines = DEFAULT_MAX_HIGHLIGHT_LINES,
}) {
  if (!content) {
    return false;
  }

  const normalizedContent = content.replace(/\r\n?/g, '\n');
  const measurableContent = normalizedContent.endsWith('\n')
    ? normalizedContent.slice(0, -1)
    : normalizedContent;
  const exceedsCharLimit =
    Number.isFinite(maxHighlightChars) &&
    maxHighlightChars > 0 &&
    measurableContent.length >= maxHighlightChars;
  const exceedsLineLimit =
    Number.isFinite(maxHighlightLines) &&
    maxHighlightLines > 0 &&
    (measurableContent ? measurableContent.split('\n').length : 0) >=
      maxHighlightLines;

  return exceedsCharLimit || exceedsLineLimit;
}

function PlainCode({ children, className }) {
  return (
    <pre>
      <code
        className={className}
        style={{ display: 'block', minWidth: 'max-content', whiteSpace: 'pre' }}
      >
        {children}
      </code>
    </pre>
  );
}

export default function Code({
  block,
  children,
  className,
  codeConfig = {},
  lang,
  ...restProps
}) {
  const content = normalizeCodeContent(children);

  if (!content) {
    return null;
  }

  const language = normalizeCodeLanguage({ className, lang });

  if (!block) {
    return <code className={className}>{content}</code>;
  }

  const {
    maxHighlightChars = DEFAULT_MAX_HIGHLIGHT_CHARS,
    maxHighlightLines = DEFAULT_MAX_HIGHLIGHT_LINES,
    renderers = {},
  } = codeConfig;
  const CustomRenderer = renderers[language];

  if (CustomRenderer) {
    return (
      <CustomRenderer
        {...restProps}
        block={block}
        className={className}
        content={content}
        language={language}
      >
        {content}
      </CustomRenderer>
    );
  }

  if (language === 'mermaid') {
    return <Mermaid>{content}</Mermaid>;
  }

  if (
    shouldUsePlainCode({
      content,
      maxHighlightChars,
      maxHighlightLines,
    })
  ) {
    return <PlainCode className={className}>{content}</PlainCode>;
  }

  const highlightLanguage = normalizeHighlightLanguage(language);

  if (!highlightLanguage) {
    return <PlainCode className={className}>{content}</PlainCode>;
  }

  return <CodeHighlighter lang={highlightLanguage}>{content}</CodeHighlighter>;
}
