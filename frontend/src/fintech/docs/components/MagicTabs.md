---
group: 通用
title: MagicTabs
order: 17
---

# MagicTabs

封装 [Tabs](https://ant-design.antgroup.com/components/tabs-cn) 使其支持持久化等特性

## 代码演示

```jsx
/**
 * title: 基础用法
 * description: 会自动进行持久化（默认使用location.pathname 作为持久化的 key）特性设置
 */
import React, { useState } from 'react';
import { MagicTabs, CheckList } from 'fintech';

export default () => {
  const [checked, setChecked] = useState(['xyj', 'shz', 'sg', 'hlm']);
  const [api, setApi] = useState(['ghost']);

  return (
    <>
      <CheckList
        value={api}
        options={['ghost', 'noTabBarBottom']}
        onChange={(e) => {
          setApi(e);
        }}
      />
      <br />
      <CheckList
        value={checked}
        options={{
          xyj: '西游记',
          shz: '水浒传',
          sg: '三国演义',
          hlm: '红楼梦',
        }}
        onChange={(e) => {
          setChecked(e);
        }}
      />
      <br />
      <br />
      <MagicTabs
        {...api.reduce((p, c) => ({ ...p, [c]: true }), {})}
        onChange={(key) => {
          console.log('回调执行：', key);
        }}
        items={[
          {
            open: checked.includes('xyj'),
            key: 'xyj',
            label: '西游记',
            children:
              '《西游记》是中国古代第一部浪漫主义章回体长篇神魔小说。今见最早的《西游记》版本是明代万历二十年金陵世德堂《新刻出像官板大字西游记》，未署作者姓名。鲁迅、董作宾等人根据《淮安府志》“吴承恩《西游记》”的记载予以最终论定“吴承恩原著”。',
          },
          {
            open: checked.includes('shz'),
            key: 'shz',
            label: '水浒传',
            children:
              '《水浒传》是元末明初施耐庵创作的长篇小说（现存刊本署名大多有施耐庵或罗贯中或两人皆有），是中国历史上第一部用白话文写成的章回体长篇小说',
          },
          {
            open: checked.includes('sg'),
            key: 'sg',
            label: '三国演义',
            children:
              '《三国演义》（又名《三国志演义》《三国志通俗演义》是元末明初小说家罗贯中根据陈寿《三国志》和裴松之注解以及民间三国故事传说经过艺术加工创作而成的长篇章回体历史演义小说，与《西游记》《水浒传》《红楼梦》并称为中国古典四大名著',
          },
          {
            open: checked.includes('hlm'),
            key: 'hlm',
            label: '红楼梦',
            children:
              '《红楼梦》，中国古代章回体长篇小说，中国古典四大名著之一。其通行本共120回，一般认为前80回是清代作家曹雪芹所著，后40回作者为无名氏，整理者为程伟元、高鹗。小说以贾、史、王、薛四大家族的兴衰为背景，以富贵公子贾宝玉为视角，以贾宝玉与林黛玉、薛宝钗的爱情婚姻悲剧为主线，描绘了一些闺阁佳人的人生百态，展现了真正的人性美和悲剧美，是一部从各个角度展现女性美以及中国古代社会百态的史诗性著作',
          },
        ]}
      />
    </>
  );
};
```

## API

| 参数           | 说明                                                                 | 类型             | 默认值            |
| :------------- | :------------------------------------------------------------------- | :--------------- | :---------------- |
| persistenceKey | 持久化标识，设置为 false 时持久化会失效                              | string \| false  | location.pathname |
| ghost          | 幽灵模式，设置后最外层将不会有 padding                               | boolean          | false             |
| noTabBarBottom | tabBar 和 children 之间是否有间距，一般配合 ProTableAsync 组件来使用 | boolean          | false             |
| onChange       | 在 persistenceKey 开启的情况下，组件初始化时也会执行一次             | function(tabKey) | -                 |
| items          | 配置选项卡内容                                                       |                  |                   |

### items

| 参数                                                                          | 说明           | 类型    | 默认值 |
| :---------------------------------------------------------------------------- | :------------- | :------ | :----- |
| [TabItemType](https://ant-design.antgroup.com/components/tabs-cn#tabitemtype) | 原生选项卡配置 |         |        |
| open                                                                          | 选项卡是否显示 | boolean | true   |

### updateKey(persistenceKey, tabKey)

> 通过函数可以搭配其他功能自定义选项卡切换

```jsx | pure
<LinkBtn
  to="/operation/blacklist"
  onClick={() => {
    MagicTabs.updateKey('blacklist', '30');
  }}
>
  go
</LinkBtn>
```

## FAQ

1. 不同版本的 destroy\* 有何区别？

   - antd < 5.25.0 时，使用 destroyInactiveTabPane
   - antd >= 5.25.0 时，使用 destroyOnHidden

2. onChange 执行机制？
   - 当 persistenceKey 开启时，使用者是不知道组件内部初始化 activeKey 是什么，所以在初始化时会执行一次
     onChange 函数。
