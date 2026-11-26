---
group: 工具
toc: content
order: 3
---

# clipboard

复制、粘贴

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState } from 'react';
import { Space, Input, Button, message } from 'antd';
import { clipboard } from 'fintech';

export default () => {
  const [value, setValue] = useState('');

  return (
    <Space orientation="vertical">
      <Space>
        <Input
          value={value}
          placeholder="输入要复制的内容"
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          onClick={() => {
            if (value) {
              clipboard.copy(value).then(() => {
                message.success('复制成功');
              });
            }
          }}
        >
          复制
        </Button>
      </Space>
      <Space>
        <Input placeholder="command + v" />
        <Button
          onClick={() => {
            clipboard.read().then((text) => {
              alert(text);
            });
          }}
        >
          读取复制内容
        </Button>
      </Space>
    </Space>
  );
};
```
