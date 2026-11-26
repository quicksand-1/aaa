import { useLayoutEffect, useRef } from 'react';
import useAsyncScripts from '../hooks/useAsyncScripts';

interface HighlightProps {
  value: string;
  language?: string;
}

export default (props: HighlightProps) => {
  const { value = '', language } = props;

  const elementRef = useRef();
  const [loading] = useAsyncScripts([
    'assets/highlight.min.css',
    'assets/highlight.min.js',
  ]);

  useLayoutEffect(() => {
    if (!loading) {
      window['hljs']?.highlightElement(elementRef.current);
    }
  }, [loading, value]);

  return (
    <pre style={{ fontSize: 14 }}>
      <code ref={elementRef} className={language ? `language-${language}` : ''}>
        {value}
      </code>
    </pre>
  );
};
