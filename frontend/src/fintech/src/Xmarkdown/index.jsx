import { XMarkdown } from '@ant-design/x-markdown';
import Latex from '@ant-design/x-markdown/plugins/Latex';
import '@ant-design/x-markdown/themes/light.css';
import React, { useMemo } from 'react';
import Code from './Code';
import './index.css';

const EMPTY_CONFIG = {};
const EMPTY_CODE_CONFIG = {};

function createCodeComponent(codeConfig) {
  return function XmarkdownCode(codeProps) {
    return <Code {...codeProps} codeConfig={codeConfig} />;
  };
}

function isBlockCodePre(domNode) {
  return domNode?.children?.some(
    (child) =>
      child?.name === 'code' && child.attribs?.['data-block'] === 'true',
  );
}

export function MarkdownPre({
  children,
  class: legacyClassName,
  className,
  classname,
  domNode,
  streamStatus,
  style,
  ...props
}) {
  const mergedClassName = [className, classname, legacyClassName]
    .filter(Boolean)
    .join(' ');

  if (isBlockCodePre(domNode)) {
    return (
      <div className="x-markdown-code-block" data-stream-status={streamStatus}>
        {children}
      </div>
    );
  }

  return (
    <pre
      {...props}
      className={mergedClassName || undefined}
      style={typeof style === 'object' ? style : undefined}
    >
      {children}
    </pre>
  );
}

export default function MarkdownPro({
  className,
  codeConfig = EMPTY_CODE_CONFIG,
  components,
  config = EMPTY_CONFIG,
  content,
  ...props
}) {
  const defaultCodeComponent = useMemo(
    () => createCodeComponent(codeConfig),
    [codeConfig],
  );
  const markdownComponents = useMemo(
    () => ({ code: defaultCodeComponent, pre: MarkdownPre, ...components }),
    [components, defaultCodeComponent],
  );
  const markdownConfig = useMemo(() => {
    const { extensions = [], ...restConfig } = config;

    return {
      ...restConfig,
      extensions: [
        ...Latex(),
        ...(Array.isArray(extensions) ? extensions : []),
      ],
    };
  }, [config]);
  const mergedClassName = ['x-markdown-light', className]
    .filter(Boolean)
    .join(' ');

  return (
    <XMarkdown
      {...props}
      className={mergedClassName}
      components={markdownComponents}
      config={markdownConfig}
      content={content}
    />
  );
}
