import { Flex, Space, Tree, message } from 'antd';
import { DescList, LinkBtn, Permission, ProTableAsync, request } from 'fintech';
import { useEffect, useState } from 'react';
import EditDrawer from './EditDrawer';

const DeptManage = () => {
  const [treeData, setTreeData] = useState([]); // 部门树
  const [selectedNode, setSelectedNode] = useState({}); // 选中的节点
  const [deptInfo, setDeptInfo] = useState(); // 部门信息

  // 获取部门树结构数据
  const queryTreeData = () => {
    request('/system/org/tree.json').then((res) => {
      setTreeData(res);
    });
  };

  useEffect(() => {
    queryTreeData();
  }, []);

  /**
   * 通过 selectedNode.key 获取基本信息
   * */
  useEffect(() => {
    if (selectedNode.key) {
      request(`/system/org/detail.json?deptCode=${selectedNode.key}`).then(
        (res) => {
          setDeptInfo(res);
        },
      );
    }

    if (!selectedNode.key && treeData.length > 0) {
      setSelectedNode({
        title: treeData[0].title,
        key: treeData[0].key,
        type: treeData[0].type,
      });
    }
  }, [selectedNode.key, treeData]);

  return (
    <Flex style={{ backgroundColor: '#fff', minHeight: '65vh' }}>
      <div
        style={{
          flex: '0 0 200px',
          borderRight: '1px solid rgba(5, 5, 5, 0.06)',
        }}
      >
        <Flex justify="space-between" style={{ padding: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 500 }}>部门</span>
          <Space>
            <Permission.Access code="dept_add">
              <EditDrawer
                type="add"
                query={queryTreeData}
                data={{ ...selectedNode }}
              />
            </Permission.Access>
            <Permission.Access code="dept_edit">
              <EditDrawer
                type="edit"
                query={queryTreeData}
                data={{ ...selectedNode }}
                setSelectedNode={setSelectedNode}
              />
            </Permission.Access>
            <Permission.Access code="dept_del">
              <LinkBtn
                color="red"
                title="删除"
                disabled={!selectedNode.key}
                content="确定删除该部门吗？"
                onOk={() => {
                  request(
                    `/system/org/remove.json?deptCode=${selectedNode.key}`,
                    {
                      method: 'DELETE',
                    },
                  ).then(() => {
                    setSelectedNode({});
                    message.success('删除成功');
                    queryTreeData();
                  });
                }}
              >
                删除
              </LinkBtn>
            </Permission.Access>
          </Space>
        </Flex>
        <Tree
          key={treeData}
          defaultExpandAll
          treeData={treeData}
          selectedKeys={[selectedNode.key]}
          onSelect={(_, { node }) => {
            if (selectedNode.key !== node.key) {
              setSelectedNode({
                title: node.title,
                key: node.key,
                type: node.type,
              });
            }
          }}
        />
      </div>
      <div style={{ padding: 10 }}>
        <DescList
          title="基本信息"
          dataSource={deptInfo}
          columns={[
            { title: '部门名称', dataIndex: 'simpleName' },
            { title: '部门性质', dataIndex: 'type' },
          ]}
        />
        <ProTableAsync
          ghost
          search={false}
          rowKey="userCode"
          headerTitle="用户列表"
          scroll={{ y: undefined }}
          manualRequest={!selectedNode.key}
          url="/system/user/page.json"
          key={selectedNode.key}
          extraParams={{
            pertainCode: selectedNode.key,
          }}
          columns={[
            {
              title: '姓名',
              dataIndex: 'userName',
            },
            {
              title: '账号',
              dataIndex: 'account',
            },
            {
              title: '角色',
              dataIndex: 'roleName',
            },
            {
              title: '所属部门',
              renderText: (r) => `${r.pDeptName} / ${r.deptName}`,
            },
            {
              title: '手机号',
              dataIndex: 'phone',
            },
            {
              title: '邮箱',
              dataIndex: 'email',
            },
            {
              title: '备注',
              ellipsis: true,
              dataIndex: 'description',
            },
          ]}
        />
      </div>
    </Flex>
  );
};

export default DeptManage;
