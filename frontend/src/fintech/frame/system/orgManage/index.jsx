import { Button } from 'antd';
import { LinkBtn, Permission, ProTableAsync } from 'fintech';
import { useRef } from 'react';
import DetailDrawer from './DetailDrawer';
import EditDrawer from './EditDrawer';
import ExtendDrawer from './ExtendDrawer';

export default () => {
  const ref = useRef();
  const isAccess = Permission.useAccess();

  return (
    <ProTableAsync
      rowKey="orgCode"
      actionRef={ref}
      url="/org/list.json"
      toolBarRender={() => [
        <Permission.Access code="org_client_add" key="add">
          <EditDrawer actionRef={ref}>
            <Button type="primary">新增</Button>
          </EditDrawer>
        </Permission.Access>,
      ]}
      columns={[
        {
          title: '参与方编码',
          dataIndex: 'orgCode',
        },
        {
          title: '参与方全称',
          dataIndex: 'orgName',
        },
        {
          search: true,
          title: '参与方简称',
          dataIndex: 'orgAbbr',
        },
        {
          title: '联系人姓名',
          dataIndex: 'linkmanName',
        },
        {
          title: '联系人手机号',
          dataIndex: 'linkmanPhone',
        },
        {
          width: 130,
          title: '操作',
          valueType: 'option',
          hideInTable: !isAccess(
            ['org_extend', 'org_client_edit', 'org_client_detail'],
            'some',
          ),
          render: (_, record) => [
            <Permission.Access key="edit" code="org_client_edit">
              <EditDrawer actionRef={ref} data={record}>
                <LinkBtn>编辑</LinkBtn>
              </EditDrawer>
            </Permission.Access>,
            <Permission.Access key="detail" code="org_client_detail">
              <DetailDrawer data={record} />
            </Permission.Access>,
            <Permission.Access key="extend" code="org_extend">
              <ExtendDrawer data={record} />
            </Permission.Access>,
          ],
        },
      ]}
    />
  );
};
