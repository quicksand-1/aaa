---
group: 通用
title: SelectList
order: 29
---

# SelectList

> 封装 [Select](https://ant-design.antgroup.com/components/select-cn)

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import { Flex } from 'antd';
import { SelectList } from 'fintech';

export default () => {
  return (
    <Flex gap="middle" vertical>
      <SelectList
        options={{ CHINA: '中国', USA: '美国' }}
        placeholder="options 是枚举对象时，无需设置 fields 属性"
      />
      <SelectList
        options={['中国', '美国']}
        placeholder="options 是字符串数组时，无需设置 fields 属性"
      />
      <SelectList
        options={[
          { label: '中国', value: 'CHINA' },
          { label: '美国', value: 'USA' },
        ]}
        placeholder="options 是原生的 label value 结构，无需设置 fields 属性"
      />
      <SelectList
        options={[
          { name: '中国', key: 'CHINA' },
          { name: '美国', key: 'USA' },
        ]}
        fields={['key', 'name']}
        placeholder="options 非原生的 label value 结构"
      />
    </Flex>
  );
};
```

```jsx
/**
 * title: 本地搜索
 * description: 可以对 label 和 value 进行搜索
 */
import React from 'react';
import { Flex } from 'antd';
import { SelectList } from 'fintech';

export default () => {
  const options = { CHINA: '中国', USA: '美国' };
  const extraOptions = [
    { name: '英格兰', key: 'ENGLAND' },
    { name: '法国', key: 'FRANCE' },
  ];
  const options2 = {
    CHINA: '中国',
    USA: '美国',
    ENGLAND: '英格兰',
    FRANCE: '法国',
  };
  const extraOptions2 = { RUSSIA: '俄罗斯', SAUDIARABIA: '沙特阿拉伯' };
  const options3 = {
    CHINA: '中国@台湾@台北',
    USA: '美国*印第安纳洲*帝普顿',
    ENGLAND: '英国~英格兰~伦敦',
    FRANCE: '法国_巴黎',
  };

  return (
    <Flex gap="middle" vertical>
      <SelectList
        localSearch
        options={options}
        fields={['key', 'name']}
        extraOptions={extraOptions}
      />
      <SelectList
        localSearch
        mode="multiple"
        options={options2}
        extraOptions={extraOptions2}
        placeholder="非数据混用情况下，可以搜索全部数据"
      />
      <SelectList
        localSearch
        options={options3}
        filterSymbol={['@', '*', '~', '_']}
        placeholder="可使用空格进行分隔搜索关键词"
      />
      <SelectList
        localSearch
        options={Object.keys(options2)}
        placeholder="大小写匹配"
      />
    </Flex>
  );
};
```

```jsx
/**
 * title: extraOptions
 */

/**
 * extraOptions 示例
 * @PS：内部会对 options 和 extraOptions 进行数据去重
 */
import React from 'react';
import { SelectList } from 'fintech';

export default () => {
  return (
    <SelectList
      fields={['key', 'name']}
      options={{ CHINA: '中国', USA: '美国', ENGLAND: '英格兰' }}
      extraOptions={[
        { name: '英格兰', key: 'ENGLAND' },
        { name: '法国', key: 'FRANCE' },
      ]}
      placeholder="extraOptions 数据会常驻下拉框中，位于 options 数据下方"
    />
  );
};
```

```jsx
/**
 * title: 自定义下拉框内容
 * description: 自定义下拉框内容后，也能正常搜索，原因是 optionRender 改变了数据的 label，但是元数据中的 name 没有变
 */
import React from 'react';
import { SelectList } from 'fintech';

export default () => {
  const options = [
    { name: '中国', key: 'CHINA' },
    { name: '美国', key: 'USA' },
    { name: '英格兰', key: 'ENGLAND' },
    { name: '法国', key: 'FRANCE' },
    { name: '俄罗斯', key: 'RUSSIA' },
    { name: '沙特阿拉伯', key: 'SAUDIARABIA' },
  ];

  return (
    <SelectList
      localSearch
      options={options}
      fields={['key', 'name']}
      placeholder="搜索国家"
      optionRender={(o) => {
        if (o.key === 'CHINA') {
          return <span style={{ color: 'red' }}>{o.name}</span>;
        }
        return o.name;
      }}
      onChange={(k, o) => console.log(o)}
    />
  );
};
```

```jsx
/**
 * title: 自定义下拉框下方的额外内容
 */
import React from 'react';
import { SelectList } from 'fintech';

export default () => {
  const options = [
    { name: '中国', key: 'CHINA' },
    { name: '美国', key: 'USA' },
    { name: '英格兰', key: 'ENGLAND' },
    { name: '法国', key: 'FRANCE' },
    { name: '俄罗斯', key: 'RUSSIA' },
    { name: '沙特阿拉伯', key: 'SAUDIARABIA' },
  ];

  return (
    <SelectList
      localSearch
      options={options}
      fields={['key', 'name']}
      placeholder="搜索国家"
      alert={<h2>这里是额外的内容</h2>}
    />
  );
};
```

```jsx
/**
 * title: 设置跳转链接
 * description: 比如这个 select 的数据是异步获取的，那么可以跳转到指定数据设置页面
 */
import React from 'react';
import { SelectList } from 'fintech';

export default () => {
  return (
    <SelectList
      localSearch
      fields={['key', 'name']}
      placeholder="搜索国家"
      linkProps={{ to: '/changelog' }}
    />
  );
};
```

```jsx
/**
 * title: 异步能力
 */
import React from 'react';
import { Flex } from 'antd';
import { SelectList } from 'fintech';

export default () => {
  return (
    <Flex gap="middle" vertical>
      <SelectList
        localSearch
        fields={['code', 'name']}
        url="/selectList/demo.json"
        placeholder="默认 load 模式"
      />
      <SelectList
        localSearch
        trigger="focus"
        fields={['code', 'name']}
        url="/selectList/demo.json"
        placeholder="focus 模式"
      />
      <SelectList
        trigger="search"
        fields={['code', 'name']}
        url="/selectList/demo.json?name="
        firstRequest
        placeholder="search 模式，url 需要配置搜索入参"
      />
      <SelectList
        url="/selectList/demo.json"
        placeholder="formatData 数据过滤"
        formatData={(d) => d.map((i) => ({ label: i.name, value: i.code }))}
      />
      <SelectList
        trigger="search"
        fields={['code', 'name']}
        url="/selectList/demo.json?"
        placeholder="searchFormat 自定义入参，输入英文时入参是 code，其他则是 name"
        searchFormat={(t) => (/^[A-Za-z]+$/.test(t[0]) ? 'code=' : 'name=')}
      />
      <SelectList
        localSearch
        fields={['code', 'name']}
        url="/selectList/demo2.json"
        placeholder="dataPath 自定义数据路径"
        dataPath={['items', 'list']}
      />
    </Flex>
  );
};
```

```jsx
/**
 * title: 缓存加载能力
 * description: 多个相同的请求组件，只会请求一次
 */
import React from 'react';
import { Flex } from 'antd';
import { SelectList } from 'fintech';

export default () => {
  return (
    <Flex gap="middle" vertical>
      {Array.from({ length: 4 }, (_, index) => (
        <SelectList
          cache
          key={index}
          localSearch
          fields={['code', 'name']}
          url="/selectList/demo.json?cache=true"
        />
      ))}
    </Flex>
  );
};
```

```jsx
/**
 * title: 字典能力
 * description: 可以自动获取字典枚举，方便业务中使用
 */
import React, { useEffect } from 'react';
import { SelectList } from 'fintech';

export default () => {
  // 返回字典数组和用于回显的方法
  const { dictEnum, dictFun } = SelectList.useDict({ dictKey: 'dateType' });

  useEffect(() => {
    if (dictFun) {
      // 一般用于数据回显
      console.log(dictFun('MONTH'));
    }
  }, [dictFun]);

  return <SelectList dictKey="dateType" placeholder="字典编码：dateType" />;
};
```

```jsx
/**
 * title: 大数据渲染
 */
import React, { useEffect, useState } from 'react';
import { SelectList } from 'fintech';

export default () => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setOptions(
        new Array(100000).fill(1).map((item, index) => ({
          label: `选项${index}`,
          value: `${index}`,
        })),
      );
    }, 1000);
  }, []);

  return <SelectList localSearch options={options} />;
};
```

```jsx
/**
 * title: 无 options 的表单回显
 */
import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { DrawerBox, FormSchema } from 'fintech';

export default () => {
  const drawerRef = useRef();
  const [extraOptions, setExtraOptions] = useState([]);

  return (
    <>
      <Button type="primary" onClick={() => drawerRef.current?.open(true)}>
        Open
      </Button>
      <DrawerBox
        form
        size="90%"
        actionRef={drawerRef}
        onOk={({ values, open }) => {
          console.log(values);
        }}
        afterOpen={({ form }) => {
          const mockBaseIndexs = [
            {
              code: '19280',
              name: '余额主题-资金包-小口径-OVD_DAY(181_xxx)-费罚',
            },
            {
              code: '19262',
              name: '余额主题-资金包-小口径-OVD_DAY(1_30)-加权年龄分子',
            },
          ];

          form.setFieldsValue({
            baseIndex: mockBaseIndexs.map((i) => i.code),
          });
          setExtraOptions(
            mockBaseIndexs.map((i) => ({
              id: i.code,
              indexDesc: i.name,
            })),
          );
        }}
      >
        <FormSchema
          items={[
            {
              name: 'baseIndex',
              label: '基础指标',
              valueType: 'select',
              inputProps: {
                extraOptions,
                mode: 'multiple',
                trigger: 'search',
                fields: ['id', 'indexDesc'],
                url: '/selectList/baseIndex/list.json?name=',
              },
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
```

## API

| 参数         | 说明                                                                          | 类型             | 默认值             |
| :----------- | :---------------------------------------------------------------------------- | :--------------- | :----------------- |
| options      | 指定可选项                                                                    | enum \| Option[] |                    |
| fields       | 需要指定的字段                                                                | [code, name]     | ['value', 'label'] |
| extraOptions | 额外的数据源，会常驻列表中，必须符合 options 支持的格式                       | enum \| Option[] |                    |
| alert        | 可以自定义下拉框下面额外区域的内容，不能和 linkProps 同时使用                 | ReactNode        |                    |
| linkProps    | LinkBtn 属性，一般用于设置跳转链接                                            | LinkBtnProps     |                    |
| localSearch  | 是否开启本地搜索，开启后可以对 label 和 value 进行搜索；默认会打开 showSearch | boolean          | false              |
| filterSymbol | 需要过滤掉的符号，在 localSearch 启用时生效                                   | string[]         | `['_', '/', '-']`  |
| width        | 组件宽度                                                                      | string \| number | '100%'             |
| actionRef    | 提供给外部的接口引用                                                          | React.Ref        |                    |
| optionRender | 自定义选项渲染函数                                                            | function(item)   |                    |
| mode         | 多选模式                                                                      | 'multiple'       |                    |

## actionRef

| 属性        | 类型    | 说明                                      |
| :---------- | :------ | :---------------------------------------- |
| isComposing | boolean | 是否正在进行拼音输入（true 表示正在输入） |

## 异步 API

| 参数         | 说明                                               | 类型                | 默认值 |
| :----------- | :------------------------------------------------- | :------------------ | :----- |
| url          | 请求地址                                           | string              |        |
| params       | 请求参数                                           | object              |        |
| dataPath     | 数据源路径，默认从 `dataObject` 中寻找             | string \| string[]  |        |
| trigger      | 数据请求时机                                       | [trigger](#trigger) | load   |
| firstRequest | 首次是否触发请求，search 模式下生效                | boolean             | false  |
| formatData   | 数据过滤                                           | function(res)       |        |
| searchFormat | 自定义 search 时的入参                             | function(input)     |        |
| cache        | 延迟缓存加载，通常用于某个页面有多个相同请求的组件 | boolean             | false  |

### trigger

| 触发模式 | 说明                       |
| :------- | :------------------------- |
| load     | 组件加载后立即请求数据     |
| focus    | 首次获得焦点时请求数据     |
| search   | 搜索模式，可以进行异步搜索 |

## 字典 API

| 参数          | 说明     | 类型    | 默认值 |
| :------------ | :------- | :------ | :----- |
| dictKey       | 字典编码 | string  |        |
| manualRequest | 手动     | boolean | false  |

### Return

| 参数     | 说明                                      | 类型          |
| :------- | :---------------------------------------- | :------------ |
| dictEnum | 字典枚举                                  | object        |
| data     | 字典枚举列表                              | array         |
| dictFun  | 获取某个 key 的 value 方法                | function(key) |
| run      | 获取字段数据，一般搭配 manualRequest 使用 | () => vold    |
