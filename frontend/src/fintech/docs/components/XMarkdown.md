---
group: agent
title: Xmarkdown
order: 3
---

# Xmarkdown

`Xmarkdown` 是基于 [@ant-design/x-markdown](https://ant-design-x.antgroup.com/x-markdowns/examples-cn) 的 Markdown 渲染组件，默认加载亮色主题，并补充了 Latex、代码高亮、Mermaid 和大代码块降级能力。

## 使用说明

- 默认支持 CommonMark、GFM 和 Latex，传入自定义 `config.extensions` 时仍会保留 Latex 扩展
- 行内代码使用原生 `<code>` 渲染；普通代码块使用 `CodeHighlighter` 渲染
- 常见 Markdown 语言别名会自动映射为 Prism 模块名，例如 `js`、`ts`、`c++`、`objective-c`、`sh`
- 语言为 `mermaid` 的代码块默认使用 `Mermaid` 渲染
- 普通高亮代码块达到 20,000 个字符或 400 行时，会降级为纯文本代码，避免高亮大文本造成明显卡顿
- `codeConfig.renderers` 可以按语言扩展代码块渲染器，适合 CSV、JSON 预览或业务 DSL
- `components.code` 会完整替换内置代码渲染流程，适合需要自行接管所有行内代码和代码块的场景
- `components.pre` 可以进一步接管代码块外层容器；默认容器会避免把 Mermaid、表格等块级组件嵌套在原生 `<pre>` 中
- 其余属性会继续透传给底层 `XMarkdown`，例如 `streaming`、`openLinksInNewTab`、`dompurifyConfig` 和 `style`

## 代码演示

```jsx
/**
 * title: 基础用法
 * description: 同时展示 Markdown、Latex、代码高亮和 Mermaid
 */
import React, { useState } from 'react';
import { Input, Space } from 'antd';
import { Xmarkdown } from 'fintech/x';

const initialContent = `# Xmarkdown

支持 **Markdown**、行内公式 $E = mc^2$，以及下面的块级公式：

$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

## JavaScript

\`\`\`javascript
const sum = (a, b) => a + b;
console.log(sum(20, 22));
\`\`\`

## Mermaid

\`\`\`mermaid
flowchart LR
  Input[Markdown] --> Parse[解析]
  Parse --> Render[渲染]
  Render --> Result[页面]
\`\`\`
`;

export default () => {
  const [content, setContent] = useState(initialContent);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.TextArea
        rows={12}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <Xmarkdown content={content} openLinksInNewTab />
    </Space>
  );
};
```

```jsx
/**
 * title: 自定义代码语言
 * description: 使用 codeConfig.renderers 扩展 csv 代码块，同时保留内置高亮和 Mermaid
 */
import React from 'react';
import { Table, Tag } from 'antd';
import { Xmarkdown } from 'fintech/x';

const content = `## 数据预览

\`\`\`csv
name,amount,status
Alpha,120,done
Beta,86,pending
\`\`\`

其他语言仍使用默认代码高亮：

\`\`\`js
const total = 120 + 86;
\`\`\`
`;

function CsvRenderer({ content, language }) {
  const [header, ...rows] = content
    .trim()
    .split('\n')
    .map((line) => line.split(','));
  const columns = header.map((title, index) => ({
    title,
    dataIndex: index,
    key: index,
  }));
  const dataSource = rows.map((row, index) => ({
    key: index,
    ...Object.fromEntries(row.map((value, cellIndex) => [cellIndex, value])),
  }));

  return (
    <div>
      <Tag color="blue">{language}</Tag>
      <Table
        size="small"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  );
}

export default () => (
  <Xmarkdown
    content={content}
    codeConfig={{
      renderers: {
        csv: CsvRenderer,
      },
    }}
  />
);
```

## API

除下表属性外，还支持底层 [`XMarkdown`](https://ant-design-x.antgroup.com/x-markdowns/examples-cn) 的其他属性。

| 参数       | 说明                                                                                          | 类型                                                     | 默认值                    |
| :--------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------- | :------------------------ |
| content    | 需要渲染的 Markdown 内容                                                                      | `string`                                                 | -                         |
| children   | Markdown 内容，作为 `content` 的别名                                                          | `string`                                                 | -                         |
| className  | 根容器类名，会与内置的 `x-markdown-light` 合并                                                | `string`                                                 | -                         |
| components | 自定义 HTML 标签组件映射；传入 `code` 时会覆盖内置代码渲染流程，传入 `pre` 时会覆盖代码块容器 | `Record<string, React.ComponentType>`                    | `{ code, pre: 内置组件 }` |
| config     | Marked.js 解析配置；`extensions` 会追加在内置 Latex 扩展之后                                  | [`MarkedExtension`](https://marked.js.org/using_pro#use) | `{ extensions: Latex() }` |
| codeConfig | 内置代码块渲染配置                                                                            | `CodeConfig`                                             | 见下表                    |

### CodeConfig

| 参数              | 说明                                                                                          | 类型                                                     | 默认值  |
| :---------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------- | :------ |
| maxHighlightChars | 代码字符数达到该值时不再进行语法高亮；设置为小于等于 `0` 的值可关闭该项限制                   | `number`                                                 | `20000` |
| maxHighlightLines | 代码行数达到该值时不再进行语法高亮；设置为小于等于 `0` 的值可关闭该项限制                     | `number`                                                 | `400`   |
| renderers         | 按代码语言注册块级自定义渲染器；代码块语言会转为小写后查找，例如 `CSV` 会匹配 `renderers.csv` | `Record<string, React.ComponentType<CodeRendererProps>>` | `{}`    |

自定义语言渲染器会收到以下核心属性：

| 参数      | 说明                                     | 类型      |
| :-------- | :--------------------------------------- | :-------- |
| content   | 规范化后的代码文本                       | `string`  |
| children  | 与 `content` 相同的代码文本              | `string`  |
| language  | 规范化后的语言名称                       | `string`  |
| block     | 是否为块级代码；自定义语言渲染器中恒为真 | `boolean` |
| className | 原始代码节点的类名                       | `string`  |

## 代码块渲染优先级

块级代码按照以下顺序选择渲染方式：

1. 命中 `codeConfig.renderers[language]` 时使用自定义语言渲染器
2. 语言为 `mermaid` 时使用内置 Mermaid
3. 达到字符数或行数限制时降级为纯文本 `<code>`
4. 其余情况使用内置 `CodeHighlighter`

如果传入 `components.code`，以上流程会被整体替换。行内代码不会进入 `codeConfig.renderers`，始终保持行内 `<code>` 语义。
