import { message } from 'antd';
import { DrawerBox, EditTable, LinkBtn, request } from 'fintech';
import { useRef, useState } from 'react';

export default (props) => {
  const { parentKey, dictName } = props;

  const drawerRef = useRef(null);
  const editTableRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sourceData, setSourceData] = useState([]); // 原始数据

  return (
    <>
      <LinkBtn onClick={() => drawerRef.current?.open(true)}>
        编辑配置项
      </LinkBtn>
      <DrawerBox
        form
        size="90%"
        actionRef={drawerRef}
        title={dictName}
        confirmLoading={loading}
        onOk={async ({ values = {} }) => {
          const { items = [] } = values;
          const fetchItems = [];
          const fetchAddItems = [];

          sourceData.forEach((i) => {
            const ids = items.map((s) => s.id);

            if (!ids.includes(i.id)) {
              fetchItems.push({
                dictId: i.id,
                method: 'DELETE',
              });
            }
          });

          items.forEach((i) => {
            const { dictKey, dictName, attr, id, num } =
              sourceData.find((s) => s.id === i.id) || {};

            const commonParams = {
              dictKey: i.dictKey,
              dictName: i.dictName,
              attr: i.attr,
              num: i.num,
            };

            if (id) {
              if (
                i.dictKey !== dictKey ||
                i.dictName !== dictName ||
                i.attr !== attr ||
                i.num !== num
              ) {
                fetchItems.push({
                  dictId: i.id,
                  method: 'EDIT',
                  ...commonParams,
                });
              }
            } else {
              fetchAddItems.push({
                ...commonParams,
              });
            }
          });

          if (fetchAddItems.length > 0) {
            await request('/system/dict/item.json', {
              method: 'POST',
              data: {
                dictKey: parentKey,
                itemList: fetchAddItems,
              },
            });
          }

          const fetchData = async (item) => {
            if (item.method === 'DELETE') {
              return request(`/system/dict/remove.json?dictId=${item.dictId}`, {
                method: 'DELETE',
              });
            }

            return request('/system/dict/edit.json', {
              method: 'POST',
              data: item,
            });
          };

          const sendSequentially = async (list) => {
            for (const item of list) {
              await fetchData(item);
            }
          };

          setLoading(true);
          await sendSequentially(fetchItems);
          setLoading(false);
          message.success('操作成功');
          drawerRef.current?.open(false);
        }}
        afterOpen={() => {
          request('/system/dict/list/detail.json', {
            setLoading,
            method: 'GET',
            params: {
              limit: 1000,
              parentKey,
            },
          }).then(({ datas = [] }) => {
            setSourceData(datas || []);
            drawerRef.current?.form.setFieldsValue({
              items: editTableRef.current.initId(datas),
            });
          });
        }}
      >
        <EditTable
          name="items"
          actionRef={editTableRef}
          columns={[
            {
              title: '字典编码',
              dataIndex: 'dictKey',
            },
            {
              title: '字典名称',
              dataIndex: 'dictName',
            },
            {
              width: 120,
              title: '排序',
              dataIndex: 'num',
              valueType: 'digit',
              required: false,
            },
            {
              width: 200,
              title: '属性',
              dataIndex: 'attr',
              valueType: 'textarea',
              fieldProps: { rows: 1 },
              required: false,
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};
