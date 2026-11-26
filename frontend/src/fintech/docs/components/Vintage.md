---
group: 图表
title: Vintage
order: 6
---

> Vintage 数据展示

```jsx
import React, { useState, useEffect } from 'react';
import { CollapseList, request, ProTableAsync, LinePro } from 'fintech';

export default () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/charts/line/vintage.json', {
      setLoading,
    }).then((res) => {
      setData(res);
    });
  }, []);

  return (
    <CollapseList
      defaultActiveKey={['overdue']}
      items={[
        {
          loading,
          key: 'overdue',
          label: '逾期率-逾期金额占比',
          children: [
            <ProTableAsync
              ghost
              key="table"
              search={false}
              rowKey="acctDate"
              headerTitle={null}
              pagination={false}
              columns={data.columns || []}
              dataSource={data.tables || []}
            />,
            <LinePro
              key="line"
              data={data.line || []}
              fields={['mob', 'vintage', 'month']}
              xAxisFormatter={(v) => `Mob${v}`}
              yAxisFormatter={(v) => `${v}%`}
              tooltipTitle={(d) => `Mob${d.mob}`}
              tooltipItems={[
                { field: 'vintage', valueFormatter: (v) => `${v}%` },
              ]}
            />,
          ],
        },
      ]}
    />
  );
};
```
