import { Tag } from 'antd';
import { DescList, DrawerBox, LinkBtn } from 'fintech';
import { useRef } from 'react';

export default (props) => {
  const { data } = props;

  const drawerRef = useRef(null);

  return (
    <>
      <LinkBtn onClick={() => drawerRef.current?.open(true)}>查看</LinkBtn>
      <DrawerBox title="详情" footer={false} actionRef={drawerRef}>
        <DescList
          bordered
          column={1}
          url="/org/get.json"
          params={{ orgCode: data.orgCode }}
          columns={[
            { dataIndex: 'orgName', title: '参与方全称' },
            { dataIndex: 'orgAbbreviation', title: '参与方简称' },
            { dataIndex: 'orgCode', title: '参与方编码' },
            { dataIndex: 'orgType.desc', title: '参与方类型' },
            { dataIndex: 'linkmanName', title: '联系人姓名' },
            { dataIndex: 'linkmanPhone', title: '联系人手机号' },
            { dataIndex: 'linkmanEmail', title: '联系人邮箱' },
            {
              open: ({ dataSource }) =>
                dataSource?.approveStatus?.code !== 'UNSUBMIT',
              dataIndex: 'deptVOList',
              title: '归属部门',
              render: (t) => {
                return (
                  <Tag color="green"> {t?.[t.length - 1]?.simpleName}</Tag>
                );
              },
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
