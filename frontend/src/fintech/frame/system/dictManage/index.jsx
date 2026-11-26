import { Button, message } from 'antd';
import { LinkBtn, Permission, ProTableAsync, request } from 'fintech';
import { useRef } from 'react';
import EditDrawer from './EditDrawer';
import EditItemDrawer from './EditItemDrawer';

const DictList = () => {
  const isAccess = Permission.useAccess();
  const ref = useRef();

  const columns = [
    {
      title: '字典编码',
      dataIndex: 'dictKey',
    },
    {
      search: true,
      title: '字典名称',
      dataIndex: 'dictName',
    },
    {
      title: '属性',
      dataIndex: 'attr',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'description',
    },
    {
      width: 240,
      valueType: 'option',
      hideInTable: !isAccess(
        [
          'dict_list_detail',
          'dict_edit',
          'dict_disable',
          'dict_enable',
          'dict_del',
        ],
        'some',
      ),
      render: (_, record) => [
        <Permission.Access code="dict_list_detail" key="detail">
          <EditItemDrawer
            parentKey={record.dictKey}
            dictName={record.dictName}
          />
        </Permission.Access>,
        <Permission.Access code="dict_edit" key="edit">
          <EditDrawer actionRef={ref} data={record}>
            <LinkBtn>编辑字典</LinkBtn>
          </EditDrawer>
        </Permission.Access>,
        record.validStatus === 1 && (
          <Permission.Access key="disable" code="dict_disable">
            <LinkBtn
              title="停用"
              content="确定停用该字典？"
              onOk={() => {
                request(`/system/dict/disable.json?dictId=${record.id}`).then(
                  () => {
                    message.success('停用成功');
                    ref.current?.reload();
                  },
                );
              }}
            >
              停用
            </LinkBtn>
          </Permission.Access>
        ),
        record.validStatus === 2 && (
          <Permission.Access key="enable" code="dict_enable">
            <LinkBtn
              title="启用"
              content="确定启用该字典？"
              onOk={() => {
                request(`/system/dict/enable.json?dictId=${record.id}`).then(
                  () => {
                    message.success('启用成功');
                    ref.current?.reload();
                  },
                );
              }}
            >
              启用
            </LinkBtn>
          </Permission.Access>
        ),
        <Permission.Access code="dict_del" key="del">
          <LinkBtn
            color="red"
            title="删除"
            content="确定删除该字典？"
            onOk={() => {
              request(`/system/dict/remove.json?dictId=${record.id}`, {
                method: 'DELETE',
              }).then(() => {
                message.success('删除成功');
                ref.current?.reload();
              });
            }}
          >
            删除
          </LinkBtn>
        </Permission.Access>,
      ],
    },
  ];

  return (
    <ProTableAsync
      actionRef={ref}
      columns={columns}
      rowKey="dictKey"
      url="/system/dict/list.json"
      toolBarRender={() => [
        <Permission.Access key="add" code="dict_add">
          <EditDrawer actionRef={ref}>
            <Button type="primary">新增字典</Button>
          </EditDrawer>
        </Permission.Access>,
      ]}
    />
  );
};
export default DictList;
