# SplitterBox 设计过程

## 背景

`antd` 的 `Splitter` 组件原生使用方式是组合式写法：

```tsx
<Splitter>
  <Splitter.Panel />
  <Splitter.Panel />
</Splitter>
```

这种写法本身没有问题，但在当前仓库里，大量组件已经采用了更偏业务配置的二次封装风格，例如：

- `MagicTabs` 使用 `items`
- `CollapseList` 使用 `items`
- `More` 使用 `items`

因此，`Splitter` 如果仍然保持完全原生的子节点组合式写法，在这个组件库内部会显得风格不一致，也不利于在复杂页面中做声明式布局配置。

## 设计目标

`SplitterBox` 的设计目标一开始就比较明确：

1. 为 `Splitter` 提供 `items` 写法
2. 保留 `Splitter` 容器层的大部分原生能力
3. 支持复杂布局场景，尤其是嵌套分栏
4. API 尽量克制，不做与官方语义冲突的再包装

它不是要替代 `antd` 原生 `Splitter`，而是提供一种更适合本仓库风格的声明式配置模式。

## 第一版思路

第一版设计时，核心想法是做一个“薄封装”：

- 外层接收 `Splitter` 的容器属性
- 新增 `items`
- 内部自动映射成 `Splitter.Panel`
- 每个 item 增加 `open` 字段，沿用仓库已有的显示控制习惯
- 支持通过 `splitter` 字段递归声明嵌套布局

对应的数据模型如下：

```ts
interface SplitterBoxItem extends Omit<Splitter.PanelProps, 'children'> {
  key: React.Key;
  open?: boolean | ((item) => boolean);
  children?: React.ReactNode;
  splitter?: SplitterBoxProps;
}

interface SplitterBoxProps extends Omit<SplitterProps, 'children'> {
  items: SplitterBoxItem[];
}
```

这版设计的重点不在“增强官方能力”，而在“把 JSX 结构转换成配置结构”。

## 为什么要支持递归 `splitter`

如果只支持一层 `items`，这个组件的价值其实有限，因为真实页面往往是多层布局，例如：

- 左侧筛选 + 右侧列表
- 上部图表 + 下部详情
- 左树右表，再在右侧继续上下分栏

如果嵌套时又退回到原生 `Splitter` 写法，API 风格会断裂：

```tsx
<SplitterBox
  items={[
    {
      key: 'left',
      children: <Filter />,
    },
    {
      key: 'right',
      children: (
        <Splitter>
          <Splitter.Panel />
          <Splitter.Panel />
        </Splitter>
      ),
    },
  ]}
/>
```

这不符合封装目标。

因此最终采用：

```ts
splitter?: SplitterBoxProps
```

让布局配置可以递归表达，保持整体语义一致。

## 关于 `open` 的设计

仓库中已有多个组件使用 `open` 作为显示控制字段，例如：

- `MagicTabs`
- `CollapseList`
- `More`
- `LinkBtn`

因此 `SplitterBox` 也延续了这一习惯，而不是重新设计一套新的显示控制参数。

`open` 的作用很纯粹：

- `true`：渲染该面板
- `false`：过滤该面板
- `function`：根据当前 item 动态决定是否渲染

内部直接复用项目已有的 `_filter` 工具处理。

## 中间出现过的两个扩展字段

在开发过程中，曾经加过两个字段：

- `bodyStyle`
- `bodyClassName`

它们的初衷是为 `items` 模式补一层常见的内容包裹容器，方便给每个面板内容区加：

- `padding`
- `overflow`
- `height: 100%`

例如最初想支持这种写法：

```tsx
{
  key: 'left',
  bodyStyle: { padding: 12 },
  children: <Table />,
}
```

这样用户就不用再手动包一层 `div`。

## 为什么最终删掉 `bodyStyle` / `bodyClassName`

虽然这两个字段使用上方便，但它们有一个明显问题：不是 `antd Splitter.Panel` 的原生 API。

这会带来两个副作用：

1. 用户会误以为这是官方就有的能力
2. 组件边界开始从“结构转换”滑向“内容布局增强”

而 `SplitterBox` 的目标应该是一个干净的结构型封装，不应该顺带引入内容容器语义。

因此最终决定删除这两个字段，把职责收回到最小范围：

- `SplitterBox` 只负责 `items -> Splitter.Panel`
- 内容怎么包裹，由调用方自己在 `children` 中决定

这让组件边界更清晰，也更接近“声明式语法糖”这个初始目标。

## 关于“是否兼容原生 children 写法”

开发过程中还讨论过另一件事：是否允许同时支持下面两种写法。

写法一：

```tsx
<SplitterBox items={[...]} />
```

写法二：

```tsx
<SplitterBox>
  <Splitter.Panel />
</SplitterBox>
```

最开始为了兼容性，曾经保留过 `children` 透传能力，甚至暴露过：

```ts
SplitterBox.Panel = Splitter.Panel;
```

这样用户既可以用 `items`，也可以继续写原生结构。

但这个方向后来被否掉了，原因很直接：

- 如果用户想写原生 `Splitter.Panel`，直接使用 `antd` 的 `Splitter` 即可
- 一个组件同时承载“配置式”和“组合式”两套模式，会让定位变模糊
- 类型设计会变复杂，文档也会变得不够聚焦

所以最终收敛为：

- `SplitterBox` 只支持 `items`
- `items` 为必填
- 不暴露 `Panel`
- 不接受原生子节点模式

这让组件的心智模型变得非常明确。

## 最终定稿

最终版本的 `SplitterBox` 是一个非常克制的封装，能力只有四类：

1. 接收 `Splitter` 容器层属性
2. 接收 `items`
3. 使用 `open` 过滤面板
4. 使用 `splitter` 递归构建嵌套布局

最终接口：

```ts
export interface SplitterBoxItem
  extends Omit<AntdSplitterPanelProps, 'children'> {
  key: React.Key;
  open?: boolean | ((item: SplitterBoxItem) => boolean);
  children?: React.ReactNode;
  splitter?: SplitterBoxProps;
}

export interface SplitterBoxProps extends Omit<AntdSplitterProps, 'children'> {
  items: SplitterBoxItem[];
}
```

最终渲染模型：

```tsx
<Splitter {...rest}>
  {items.map((item) => (
    <Splitter.Panel key={item.key} {...panelProps}>
      {item.splitter ? <SplitterBox {...item.splitter} /> : item.children}
    </Splitter.Panel>
  ))}
</Splitter>
```

## 最终原则

`SplitterBox` 最终遵循的是下面几条原则：

- 只解决 `Splitter` 的 `items` 写法问题
- 不重复封装 `antd` 原生已经表达得很清楚的能力
- 不引入与官方不一致的额外布局语义
- 尽量复用仓库既有约定，例如 `open`
- 保持可以表达复杂嵌套布局

## 适用场景

这类封装适合：

- 需要通过配置生成布局结构的页面
- 页面布局层级较深，希望递归声明
- 想和仓库内其他 `items` 风格组件保持一致

不适合：

- 完全偏好原生组合式 JSX 的调用方式
- 需要高度自由控制 `Splitter.Panel` 内部结构且不希望经过任何封装

这两类场景下，直接使用 `antd` 原生 `Splitter` 更合适。

## 对应源码

- `src/SplitterBox/index.tsx`
- `docs/components/SplitterBox.md`

如果后续继续演进，建议仍然坚持“克制封装”的方向，不要把它扩展成一个带大量布局语义的容器组件。
