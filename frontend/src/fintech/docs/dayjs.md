---
sidebar: false
---

---

#### [DateQuick 日期禁用用例](/components/date-quick#docs-components-date-quick-demo-1)

#### 将某个日期格式化成上个月和这个月的区间

```jsx | pure
// 2025-04-30 => 2025-03 ~ 2025-04
const previousMonthRange = (dateStr = '') => {
  const date = dayjs(dateStr);
  const prevMonth = date.subtract(1, 'month');

  return `${prevMonth.format('YYYY-MM')} ~ ${date.format('YYYY-MM')}`;
};
```

#### 某个月份的下个月的第一天

```jsx | pure
// 2025-08 => 2025-09-01
const firstDayOfNextMonth = (monthStr = '') => {
  return dayjs(`${monthStr}-01`).add(1, 'month').format('YYYY-MM-DD');
};
```

#### 月份的最后一天

```jsx | pure
// 2025-08 => 2025-08-31
const lastDayOfMonth = (monthStr = '') => {
  return dayjs(`${monthStr}-01`)
    .add(1, 'month')
    .subtract(1, 'day')
    .format('YYYY-MM-DD');
};
```
