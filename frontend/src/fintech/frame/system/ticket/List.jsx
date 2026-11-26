/**
 * 字典：
 *   工单业务类型：Ticket_Biz_Type
 *     - 路由跳转绑定
 * */

import {
  AutoRefresh,
  ProTableAsync,
  SelectList,
  TicketDrawer,
  TicketStatusEnum,
} from 'fintech';
import { useRef } from 'react';

export default ({ url, type }) => {
  const formRef = useRef();
  const tableRef = useRef();
  const { dictEnum: businessTypeEnum } = SelectList.useDict({
    dictKey: 'Ticket_Biz_Type',
  });

  const columns = [
    {
      width: 230,
      copyable: true,
      title: '业务编号',
      dataIndex: 'businessKey',
      tipIndex: 'workOrdCode',
    },
    {
      search: true,
      title: '工单名称',
      dataIndex: 'workOrdName',
    },
    {
      title: '工单业务类型',
      dataIndex: 'businessType',
      valueType: 'select',
      valueEnum: businessTypeEnum,
      search: { transform: (v) => ({ bizType: v }) },
    },
    {
      title: '申请人',
      dataIndex: 'applyUserName',
    },
    // {
    //   title: '当前审批节点',
    //   dataIndex: 'currentApprovalNode',
    // },
    {
      title: '审批状态',
      dataIndex: 'currentApprovalStatus',
      valueEnum: TicketStatusEnum,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      width: 60,
      valueType: 'option',
      render: (_, record) => [
        <TicketDrawer key="a" data={record} actionRef={tableRef} />,
      ],
    },
  ];

  return (
    <ProTableAsync
      ghost
      url={url}
      columns={columns}
      formRef={formRef}
      headerTitle={false}
      rowKey="businessKey"
      actionRef={tableRef}
      search={{
        optionRender: (searchConfig, formProps, dom) => {
          if (type !== 'apply') {
            return dom;
          }

          return [
            <AutoRefresh
              key="auto"
              persistenceKey={false}
              callback={() => {
                formRef.current?.submit();
              }}
            />,
            ...dom,
          ];
        },
      }}
    />
  );
};
