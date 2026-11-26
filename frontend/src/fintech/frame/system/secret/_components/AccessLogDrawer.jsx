import { DrawerBox, ProTableAsync } from 'fintech';
import React, { cloneElement, useRef } from 'react';

const REQUEST_METHOD_ENUM = {
  GET: { text: 'GET' },
  POST: { text: 'POST' },
  PUT: { text: 'PUT' },
  DELETE: { text: 'DELETE' },
  PATCH: { text: 'PATCH' },
};

const DECISION_ENUM = {
  ALLOW: { text: '通过', status: 'Success' },
  DENY: { text: '拒绝', status: 'Error' },
};

/** 将日期时间范围转换为后端日志查询协议。 */
export function transformAccessLogTimeRange(value) {
  const formatValue = (item) => {
    if (!item) return undefined;
    return typeof item.format === 'function'
      ? item.format('YYYY-MM-DD HH:mm:ss')
      : item;
  };

  return {
    startTime: formatValue(value?.[0]),
    endTime: formatValue(value?.[1]),
  };
}

/** 单个 API Token 的调用日志抽屉。 */
export default function AccessLogDrawer({
  children,
  record,
  url = '/system/apitoken/access-logs.json',
}) {
  const drawerRef = useRef(null);
  const tableActionRef = useRef(null);

  const wrappedChild = cloneElement(children, {
    onClick: (...args) => {
      children.props?.onClick?.(...args);
      drawerRef.current?.open(true);
    },
  });

  const columns = [
    {
      title: '调用时间',
      dataIndex: 'gmtCreate',
    },
    {
      title: '时间范围',
      dataIndex: 'gmtCreateRange',
      hideInTable: true,
      search: { transform: transformAccessLogTimeRange },
      valueType: 'dateTimeRange',
    },
    {
      title: '方法',
      dataIndex: 'requestMethod',
      search: true,
      valueEnum: REQUEST_METHOD_ENUM,
      valueType: 'select',
    },
    {
      title: '请求路径',
      dataIndex: 'requestPath',
      ellipsis: true,
      search: true,
    },
    {
      title: '结果',
      dataIndex: 'decision',
      search: true,
      valueEnum: DECISION_ENUM,
      valueType: 'tag',
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      search: true,
      valueType: 'digit',
    },
    {
      title: '耗时',
      dataIndex: 'durationMs',
      renderText: (value) => (value || value === 0 ? `${value} ms` : '-'),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      renderText: (value) => value || '-',
    },
    {
      title: '拒绝原因',
      dataIndex: 'denyReason',
      ellipsis: true,
      renderText: (value) => value || '-',
    },
    {
      title: 'Request ID',
      dataIndex: 'requestId',
      copyable: true,
      ellipsis: true,
    },
  ];

  return (
    <>
      {wrappedChild}
      <DrawerBox
        actionRef={drawerRef}
        afterOpen={() => tableActionRef.current?.reload()}
        destroyOnHidden
        footer={null}
        size="90%"
        title={`调用日志 - ${record?.tokenName || ''}`}
      >
        <ProTableAsync
          actionRef={tableActionRef}
          className="[&_.ant-pagination-options]:!hidden"
          columns={columns}
          expandable={{
            expandedRowRender: (log) => (
              <div className="grid gap-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-700">Trace ID：</span>
                  {log.traceId || '-'}
                </div>
                <div className="break-all">
                  <span className="font-medium text-slate-700">
                    User-Agent：
                  </span>
                  {log.userAgent || '-'}
                </div>
              </div>
            ),
          }}
          extraParams={{ tokenId: record?.id }}
          pagination={{ defaultPageSize: 20, showSizeChanger: false }}
          search={{ span: 8 }}
          url={url}
        />
      </DrawerBox>
    </>
  );
}
