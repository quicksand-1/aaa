/**
 * @params
 *   - id：编辑器id，默认 editor
 *   - value：初始值
 *   - rows：行数，默认 10
 *   - config：编辑器配置项，默认 {}
 * @theme：样式，默认 default，其他主题需要引入额外的样式文件
 *   monokai：暗色主题，高对比度（红/橙/紫色系）
 *   rubyblue：蓝绿色调，适合 SQL/Python 等语言
 *   cobalt：深蓝色背景，亮色文本，护眼风格
 *   blackboard：黑板风格，绿色文本模拟传统教学
 *   base16-dark：通用暗色主题，支持多语言
 * */

import { useEffect, useRef, useState } from 'react';
import useAsyncScripts from '../hooks/useAsyncScripts';

type CodeMirrorProps = {
  mode: 'sql';
  id: string;
  value?: string;
  height?: number;
  autoHeight?: boolean;
  onChange?: (v: string) => void;
  config?: object;
};

export default ({
  mode = 'sql',
  id = 'mirror',
  height = 100,
  autoHeight = false,
  value,
  onChange,
  config = {},
}: CodeMirrorProps) => {
  const [loading] = useAsyncScripts([
    'assets/codemirror.js',
    `assets/codemirror.${mode}.js`,
    'assets/codemirror.css',
  ]);
  const refValue = useRef(false); // 是否有初始值
  const [editor, setEditor] = useState();

  /**
   * 初始化编辑器
   * */
  useEffect(() => {
    if (!loading && !editor) {
      const e = window['CodeMirror'](document.getElementById(id), {
        mode: 'text/x-sql',
        lineNumbers: true,
        tabSize: 4,
        indentUnit: 4,
        smartIndent: true, // 根据语法自动智能缩进
        indentWithTabs: false, // 禁用 Tab 键缩进（改为空格缩进）
        electricChars: true, // 输入特定字符时自动触发缩进或格式调整
        autoCloseBrackets: true, // 输入左括号时自动补全右括号
        matchBrackets: true, // 光标靠近括号时高亮匹配的括号
        autoRefresh: true, // 自动刷新编辑器视图（用于动态内容场景）
        foldGutter: true, // 启用代码折叠边栏
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        ...config,
      });
      e.setSize(null, '100%');
      e.on('change', function (cm) {
        refValue.current = true;
        onChange?.(cm.getValue());

        // 如果开启了自适应高度
        if (autoHeight) {
          setTimeout(() => {
            // @ts-ignore
            const height2 = document.querySelector(
              `#${id} .CodeMirror-sizer`,
            ).offsetHeight;
            e.setSize(null, height2 > height ? height2 : height);
          }, 60);
        }
      });
      setEditor(e);
    }
  }, [loading, editor]);

  /**
   * 初始化时回显值填充
   * */
  useEffect(() => {
    if (value && editor && !refValue.current) {
      // @ts-ignore
      editor.setValue(value);
    }
  }, [loading, editor, value]);

  return (
    <div
      id={id}
      style={{
        width: '100%',
        fontSize: 14,
        lineHeight: 1.6,
        border: '1px solid #eee',
        ...(!autoHeight && {
          height,
          resize: 'vertical',
          overflow: 'auto',
        }),
      }}
    />
  );
};
