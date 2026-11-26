---
group: 通用
title: DateQuick
order: 6
---

# DateQuick

封装 [DatePicker](https://ant-design.antgroup.com/components/date-picker-cn)
，使其可以自由的从 [dayjs](https://day.js.org/docs/zh-CN/display/format) 转为 string 类型，反之亦然；一般搭配 Form 表单来使用

## 代码演示

```jsx
/**
 * title: 基础用法
 */
import React from 'react';
import dayjs from 'dayjs';
import { Space } from 'antd';
import { DateQuick } from 'fintech';

export default () => {
  return (
    <Space orientation="vertical">
      <span>
        日期：
        <DateQuick value="2024-06-26" />
      </span>
      <span>
        周：
        <DateQuick
          value="2024-06-26"
          picker="week"
          format={(v) => dayjs(v).week()}
        />
      </span>
      <span>
        时间：
        <DateQuick
          value="2024-06-26 12:12:12"
          showTime
          format="YYYY-MM-DD hh:mm:ss"
        />
      </span>
      <span>
        月份：
        <DateQuick value="2024-06" picker="month" format="YYYY-MM" />
      </span>
      <span>
        季度：
        <DateQuick
          value="2024-06"
          picker="quarter"
          format={(v) => dayjs(v).quarter()}
          onChange={(a, b) => console.log(a, b)}
        />
      </span>
      <span>
        年份：
        <DateQuick value="2024" picker="year" format="YYYY" />
      </span>
      <span>
        日期区间：
        <DateQuick type="RangePicker" value={['2024-06-21', '2024-06-26']} />
      </span>
      <span>
        时间区间：
        <DateQuick
          type="RangePicker"
          showTime
          value={['2024-06-21 12:12:12', '2024-06-26 12:12:12']}
          format="YYYY-MM-DD hh:mm:ss"
        />
      </span>
    </Space>
  );
};
```

```jsx
/**
 * title: 禁用日期
 */
import React from 'react';
import { Flex } from 'antd';
import { DateQuick } from 'fintech';

export default () => {
  return (
    <Flex vertical gap="small">
      <div>日期</div>
      <DateQuick
        placeholder="禁用今日之前（不含当日）"
        disabledDate={(current, { dayjs }) => {
          return current < dayjs().subtract(1, 'day');
        }}
      />
      <DateQuick
        placeholder="禁用今日和之前（含当日）"
        disabledDate={(current, { dayjs }) => {
          return current < dayjs().subtract(0, 'day');
        }}
      />
      <DateQuick
        placeholder="禁用今日之后（不含当日）"
        disabledDate={(current, { dayjs }) => {
          return current > dayjs();
        }}
      />
      <DateQuick
        placeholder="禁用今日和之后（含当日）"
        disabledDate={(current, { dayjs }) => {
          return current > dayjs().subtract(1, 'day');
        }}
      />
      <div>月份</div>
      <DateQuick
        picker="month"
        format="YYYY-MM"
        placeholder="禁用当前月之前（不含当前月）"
        disabledDate={(current, { dayjs }) => {
          return current < dayjs().subtract(0, 'month').startOf('day');
        }}
      />
      <DateQuick
        picker="month"
        format="YYYY-MM"
        placeholder="禁用当前月和之前（含当前月）"
        disabledDate={(current, { dayjs }) => {
          return current < dayjs().subtract(-1, 'month').startOf('day');
        }}
      />
      <DateQuick
        picker="month"
        format="YYYY-MM"
        placeholder="禁用当前月之后（不含当前月）"
        disabledDate={(current, { dayjs }) => {
          return current > dayjs().subtract(0, 'month').startOf('day');
        }}
      />
      <DateQuick
        picker="month"
        format="YYYY-MM"
        placeholder="禁用当前月和之后（含当前月）"
        disabledDate={(current, { dayjs }) => {
          return current > dayjs().subtract(1, 'month').startOf('day');
        }}
      />
    </Flex>
  );
};
```

```jsx
/**
 * title: 动态禁用日期
 */
import React, { useState } from 'react';
import { Flex, InputNumber } from 'antd';
import { DateQuick, RadioList } from 'fintech';

export default () => {
  const [picker, setPicker] = useState('date');
  const [radio, setRadio] = useState('>');
  const [num, setNum] = useState(0);

  return (
    <Flex vertical gap="small">
      <RadioList
        value={picker}
        options={['date', 'month']}
        onChange={(e) => setPicker(e.target.value)}
      />
      <RadioList
        value={radio}
        options={{ '>': '禁用当前之后', '<': '禁用当前之前' }}
        onChange={(e) => setRadio(e.target.value)}
      />
      <InputNumber
        placeholder="禁用天数"
        value={num}
        precision={0}
        onChange={(v) => setNum(v)}
      />
      <div>日期</div>
      <DateQuick picker={picker} disabledDate={`${radio}${num}`} />
    </Flex>
  );
};
```

## API

| 参数         | 说明                                                              | 类型                                                                                         | 默认值     |
| :----------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------- |
| format       | 日期格式                                                          | string                                                                                       | YYYY-MM-DD |
| type         | 组件类型                                                          | `RangePicker`                                                                                |            |
| disabledDate | 不可选择的日期，对原有的接口做了修改，增加了 dayjs 参数，方便调用 | `(currentDate: dayjs, info: { from?: dayjs, type: Picker, dayjs: typeOf dayjs }) => boolean` |            |
