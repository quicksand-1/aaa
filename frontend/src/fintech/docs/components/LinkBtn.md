---
group: 通用
title: LinkBtn
order: 18
---

# LinkBtn

封装了 Ant Design Button 的增强型按钮组件

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React, { useState } from 'react';
import { Space, Divider, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { LinkBtn } from 'fintech';

export default () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('操作成功');
    }, 1000);
  };

  return (
    <div>
      <Divider titlePlacement="start">1. 纯文本</Divider>
      <Space>
        <LinkBtn>普通</LinkBtn>
        <LinkBtn disabled>disabled</LinkBtn>
        <LinkBtn loading={loading} onClick={handleClick}>
          loading
        </LinkBtn>
        <LinkBtn color="red">red</LinkBtn>
        <LinkBtn color="orange">orange</LinkBtn>
        <LinkBtn color="green">green</LinkBtn>
      </Space>

      <Divider titlePlacement="start">2. 纯 icon</Divider>
      <Space>
        <LinkBtn>
          <EditOutlined />
        </LinkBtn>
        <LinkBtn disabled>
          <DeleteOutlined />
        </LinkBtn>
        <LinkBtn loading={loading} onClick={handleClick}>
          <EyeOutlined />
        </LinkBtn>
        <LinkBtn color="red">
          <DeleteOutlined />
        </LinkBtn>
        <LinkBtn color="orange">
          <EditOutlined />
        </LinkBtn>
        <LinkBtn color="green">
          <PlusOutlined />
        </LinkBtn>
      </Space>

      <Divider titlePlacement="start">3. 文本+icon</Divider>
      <Space>
        <LinkBtn>
          <EditOutlined /> 编辑
        </LinkBtn>
        <LinkBtn disabled>
          <DeleteOutlined /> 删除
        </LinkBtn>
        <LinkBtn loading={loading} onClick={handleClick}>
          <EyeOutlined /> 查看
        </LinkBtn>
        <LinkBtn color="red">
          <DeleteOutlined /> 删除
        </LinkBtn>
        <LinkBtn color="orange">
          <EditOutlined /> 编辑
        </LinkBtn>
        <LinkBtn color="green">
          <PlusOutlined /> 添加
        </LinkBtn>
      </Space>
    </div>
  );
};
```

```jsx
/**
 * title: PresetColors
 */
import React from 'react';
import { Flex } from 'antd';
import { LinkBtn } from 'fintech';

export default () => {
  return (
    <Flex gap="small" wrap>
      <LinkBtn color="primary">primary(系统主色)</LinkBtn>
      <LinkBtn color="purple">purple</LinkBtn>
      <LinkBtn color="cyan">cyan</LinkBtn>
      <LinkBtn color="green">green</LinkBtn>
      <LinkBtn color="magenta">magenta</LinkBtn>
      <LinkBtn color="pink">pink</LinkBtn>
      <LinkBtn color="red">red</LinkBtn>
      <LinkBtn color="orange">orange</LinkBtn>
      <LinkBtn color="yellow">yellow</LinkBtn>
      <LinkBtn color="volcano">volcano</LinkBtn>
      <LinkBtn color="geekblue">geekblue</LinkBtn>
      <LinkBtn color="lime">lime</LinkBtn>
      <LinkBtn color="gold">gold</LinkBtn>
    </Flex>
  );
};
```

```jsx
/**
 * title: 链接跳转
 */
import React from 'react';
import { Space, Divider, message } from 'antd';
import { LinkBtn } from 'fintech';

export default () => {
  return (
    <div>
      <Divider titlePlacement="start">基础跳转</Divider>
      <Space>
        <LinkBtn to="/user/detail">跳转到详情页</LinkBtn>
        <LinkBtn to="/settings">跳转到设置页</LinkBtn>
      </Space>

      <Divider titlePlacement="start">新窗口打开</Divider>
      <Space>
        <LinkBtn to="/user/detail" target="_blank">
          新窗口打开详情页
        </LinkBtn>
        <LinkBtn to="/settings" target="_blank">
          新窗口打开设置页
        </LinkBtn>
      </Space>

      <Divider titlePlacement="start">带参数的跳转</Divider>
      <Space>
        <LinkBtn to={`/user/detail?id=123`}>跳转到用户详情</LinkBtn>
        <LinkBtn to={`/project/detail?no=abc123`}>跳转到项目详情</LinkBtn>
      </Space>

      <Divider titlePlacement="start">原生链接与下载</Divider>
      <Space>
        <LinkBtn href="https://example.com" target="_blank" rel="noreferrer">
          打开外部链接
        </LinkBtn>
        <LinkBtn href="/template/example.xlsx" download="example.xlsx">
          下载文件
        </LinkBtn>
      </Space>

      <Divider titlePlacement="start">跳转前执行操作</Divider>
      <Space>
        <LinkBtn
          to="/user/detail"
          onClick={() => {
            message.info('跳转到详情页');
          }}
        >
          跳转并提示
        </LinkBtn>
        <LinkBtn
          to="/settings"
          onClick={() => {
            console.log('跳转到设置页');
          }}
        >
          跳转并记录日志
        </LinkBtn>
      </Space>
    </div>
  );
};
```

```jsx
/**
 * title: confirm模式
 */
import React, { useState } from 'react';
import { Space, Divider, Tag, message } from 'antd';
import { LinkBtn } from 'fintech';

export default () => {
  const [status, setStatus] = useState('1');

  const handleConfirm = (action) => {
    message.success(`${action}成功`);
  };

  return (
    <div>
      <Space separator={<Divider orientation="vertical" />}>
        <LinkBtn
          remark
          placeholder="额外的信息，会在 onOk 中使用"
          title="提示"
          content="确认提交该内容？"
          onOk={(input) => {
            console.log(input);
            message.success('提交成功');
          }}
        >
          提交
        </LinkBtn>
        <LinkBtn
          color="red"
          title="删除"
          content="确定删除该信息？"
          onOk={() => {
            handleConfirm('删除');
          }}
        >
          删除
        </LinkBtn>
        <LinkBtn
          variant="solid"
          title="提示"
          content="确认提交该内容？"
          onOk={() => {
            handleConfirm('提交');
          }}
        >
          提交
        </LinkBtn>
        <LinkBtn
          color="red"
          variant="solid"
          title="删除"
          content="确定删除该信息？"
          onOk={() => {
            handleConfirm('删除');
          }}
        >
          删除
        </LinkBtn>
        <LinkBtn
          method={false}
          title="删除"
          content="确定删除该信息？"
          onOk={() => {
            handleConfirm('删除');
          }}
        >
          <Tag color="error">删除</Tag>
        </LinkBtn>
      </Space>

      <Divider titlePlacement="start">实际业务场景</Divider>
      <Space orientation="vertical">
        <LinkBtn
          title="停用"
          color="orange"
          hidden={status === '2'}
          content="确定停用该用户？"
          onOk={() => {
            setStatus('2');
            handleConfirm('停用');
          }}
        >
          停用
        </LinkBtn>
        <LinkBtn
          title="启用"
          color="green"
          hidden={status === '1'}
          content="确定启用该用户？"
          onOk={() => {
            setStatus('1');
            handleConfirm('启用');
          }}
        >
          启用
        </LinkBtn>
        <LinkBtn
          title="重置密码"
          content="确定重置用户密码？"
          onOk={() => {
            handleConfirm('重置密码');
          }}
        >
          重置密码
        </LinkBtn>
        <LinkBtn
          color="red"
          title="删除"
          content="确定删除该用户？"
          onOk={() => {
            handleConfirm('删除');
          }}
        >
          删除
        </LinkBtn>
      </Space>
    </div>
  );
};
```

```jsx
/**
 * title: 显示/隐藏
 */
import React, { useState } from 'react';
import { Flex } from 'antd';
import { LinkBtn, RadioList } from 'fintech';

export default () => {
  const [open, setOpen] = useState(true);

  return (
    <Flex vertical gap={12}>
      <RadioList
        value={open ? '显示' : '隐藏'}
        options={['显示', '隐藏']}
        onChange={(o) => {
          setOpen(o.target.value === '显示');
        }}
      />
      <Flex gap={12}>
        <LinkBtn open={open}>普通</LinkBtn>
        <LinkBtn
          remark
          open={open}
          placeholder="额外的信息，会在 onOk 中使用"
          title="提示"
          content="确认提交该内容？"
          onOk={(input) => {
            console.log(input);
          }}
        >
          提交
        </LinkBtn>
      </Flex>
    </Flex>
  );
};
```

```jsx
/**
 * title: tooltip 提示
 */
import React from 'react';
import { Divider } from 'antd';
import { LinkBtn } from 'fintech';

export default () => {
  return (
    <div>
      <Divider titlePlacement="start">基础 tooltip</Divider>
      <LinkBtn tooltip="这是一个普通按钮">普通按钮</LinkBtn>

      <Divider titlePlacement="start">带位置的 tooltip</Divider>
      <div style={{ display: 'flex', gap: '20px' }}>
        <LinkBtn tooltip="顶部提示" tooltipProps={{ placement: 'top' }}>
          顶部
        </LinkBtn>
        <LinkBtn tooltip="底部提示" tooltipProps={{ placement: 'bottom' }}>
          底部
        </LinkBtn>
        <LinkBtn tooltip="左侧提示" tooltipProps={{ placement: 'left' }}>
          左侧
        </LinkBtn>
        <LinkBtn tooltip="右侧提示" tooltipProps={{ placement: 'right' }}>
          右侧
        </LinkBtn>
      </div>

      <Divider titlePlacement="start">不同类型的 tooltip 按钮</Divider>
      <div style={{ display: 'flex', gap: '20px' }}>
        <LinkBtn color="red" tooltip="危险按钮">
          危险按钮
        </LinkBtn>
        <LinkBtn color="orange" tooltip="警告按钮">
          警告按钮
        </LinkBtn>
        <LinkBtn color="green" tooltip="成功按钮">
          成功按钮
        </LinkBtn>
      </div>

      <Divider titlePlacement="start">与其他功能结合</Divider>
      <div style={{ display: 'flex', gap: '20px' }}>
        <LinkBtn tooltip="跳转到详情页" to="/user/detail">
          带链接的按钮
        </LinkBtn>
        <LinkBtn
          color="red"
          tooltip="点击确认删除"
          onOk={() => console.log('删除操作')}
        >
          带确认的按钮
        </LinkBtn>
      </div>
    </div>
  );
};
```

```jsx
/**
 * title: 高级用法
 */
import React, { useState, useRef } from 'react';
import { Divider, Tag, Popover, Button, Table, message } from 'antd';
import { LinkBtn, DrawerBox } from 'fintech';

export default () => {
  const drawerRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div>
      <Divider titlePlacement="start">与 Tag 配合</Divider>
      <div style={{ display: 'flex', gap: '12px' }}>
        <LinkBtn
          tooltip="点击添加标签"
          onClick={() => {
            message.success('添加标签');
          }}
        >
          <Tag color="processing">添加</Tag>
        </LinkBtn>
        <LinkBtn
          color="red"
          title="清空标签"
          content="确定清空所有标签？"
          onOk={() => {
            message.success('清空成功');
          }}
        >
          <Tag color="error" style={{ cursor: 'pointer' }}>
            清空
          </Tag>
        </LinkBtn>
      </div>

      <Divider titlePlacement="start">与 Popover 配合</Divider>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Popover
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          content={
            <div>
              <p>这是一个 Popover 内容</p>
              <Button
                type="primary"
                size="small"
                onClick={() => setPopoverOpen(false)}
              >
                关闭
              </Button>
            </div>
          }
        >
          <LinkBtn>点击打开 Popover</LinkBtn>
        </Popover>
        <Popover
          title="变量说明"
          content={
            <Table
              size="small"
              rowKey="code"
              pagination={false}
              columns={[
                { title: '变量名', dataIndex: 'name' },
                { title: '变量代码', dataIndex: 'code' },
              ]}
              dataSource={[
                { name: '项目名称', code: '{PROJECT_NAME}' },
                { name: '报告年份', code: '{REPORT_YEAR}' },
              ]}
            />
          }
        >
          <LinkBtn>查看变量列表</LinkBtn>
        </Popover>
      </div>

      <Divider titlePlacement="start">与 DrawerBox 配合</Divider>
      <div style={{ display: 'flex', gap: '12px' }}>
        <LinkBtn onClick={() => drawerRef.current?.open(true)}>
          打开抽屉
        </LinkBtn>
        <DrawerBox
          title="详情"
          footer={null}
          actionRef={drawerRef}
          afterOpen={() => {
            message.info('抽屉已打开');
          }}
        >
          <p>这是一个 DrawerBox 内容</p>
        </DrawerBox>
      </div>
    </div>
  );
};
```

## API

| 参数         | 说明                                                           | 类型                                        | 默认值  |
| :----------- | :------------------------------------------------------------- | :------------------------------------------ | :------ |
| variant      | 按钮形态                                                       | 'link' \| 'text' \| 'outlined' \| 'default' | link    |
| disabled     | 设置按钮失效状态                                               | boolean                                     | false   |
| loading      | 设置按钮载入状态                                               | boolean                                     | false   |
| to           | Link 的跳转地址                                                | string                                      |         |
| href         | 原生链接地址，本地路径自动拼接 platform proxy                  | string                                      |         |
| target       | 链接打开方式，如 '\_blank' 新窗口打开                          | string                                      |         |
| color        | 按钮颜色                                                       | string                                      | primary |
| open         | 是否可见，请不要使用原生的 hidden                              | boolean                                     | true    |
| hidden       | 是否隐藏按钮                                                   | boolean                                     | false   |
| tooltip      | 提示文本，支持 React 节点                                      | React.ReactNode                             |         |
| tooltipProps | 提示框属性，可自定义位置、样式等，参考 Ant Design Tooltip 组件 | object                                      |         |

## confirm

| 参数       | 说明                                                     | 类型                                                              | 默认值 |
| :--------- | :------------------------------------------------------- | :---------------------------------------------------------------- | :----- |
| method     | 按钮模式；true 时使用 LinkBtn；false 时可自定义 children | boolean                                                           | true   |
| modalProps | Modal.confirm 的属性                                     | [ModalProps](https://ant-design.antgroup.com/components/modal-cn) | {}     |
| title      | 提示信息的标题                                           | ReactNode                                                         |        |
| content    | 提示信息的内容                                           | ReactNode                                                         |        |
| okText     | 确认按钮的文案                                           | string                                                            | 确定   |
| cancelText | 取消按钮的文案                                           | string                                                            | 取消   |
| onOk       | 确定按钮的回调                                           | function                                                          |        |
| remark     | 简易输入框，可在 onOk 中获取输入内容                     | boolean                                                           | false  |
