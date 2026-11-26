/**
 * 数据权限
 * */

import { message } from 'antd';
import {
  DrawerBox,
  EditTable,
  FormItem,
  FormSchema,
  LinkBtn,
  MagicTabs,
  request,
  SelectList,
} from 'fintech';
import { useRef, useState } from 'react';

export default (props) => {
  const { data } = props;

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scopeList, setScopeList] = useState([]); // 基础权限选择列表，请求后端获得

  return (
    <>
      <LinkBtn onClick={() => drawerRef.current?.open(true)}>数据权限</LinkBtn>
      <DrawerBox
        form
        size="700"
        title="数据权限"
        actionRef={drawerRef}
        confirmLoading={loading}
        onOk={({ values, open }) => {
          request('/system/data/save.json', {
            setLoading,
            method: 'POST',
            data: values,
          }).then(() => {
            open(false);
            message.success('保存成功');
          });
        }}
        afterOpen={({ form }) => {
          request('/dict/dataScope.json').then((res) => {
            setScopeList(res);
          });

          // 回显
          request(`/system/data/user.json?userCode=${data.userCode}`, {
            setLoading,
          }).then((res) => {
            form.setFieldsValue({
              scopeType: res.scopeType,
              relationCode: res.userCode,
              scopeDataValue: res.deptScopes || [],
              rangeDatas: res.dataModels || [],
            });
          });
        }}
      >
        <FormSchema
          unique="relationCode"
          items={[
            {
              name: 'scopeType',
              label: '基础权限',
              valueType: 'radio',
              inputProps: {
                options: scopeList,
                fields: ['dictKey', 'dictName'],
              },
            },
            ({ scopeType }) =>
              !!scopeType &&
              scopeType !== 'ALL' && (
                <MagicTabs
                  ghost
                  key="extra"
                  persistenceKey={false}
                  items={[
                    {
                      key: 'dept',
                      label: '额外部门权限',
                      children: (
                        <FormItem
                          noStyle
                          required={false}
                          name="scopeDataValue"
                          valueType="tree"
                          inputProps={{
                            cache: true,
                            checkStrictly: true,
                            url: `/system/data/dept/tree.json?userCode=${data.userCode}`,
                          }}
                        />
                      ),
                    },
                    {
                      key: 'data',
                      label: '额外数据权限',
                      forceRender: true,
                      children: (
                        <EditTable
                          name="rangeDatas"
                          columns={[
                            {
                              width: 200,
                              title: '数据类型',
                              dataIndex: 'type',
                              formItemRender: (item, _, form2) => (
                                <SelectList
                                  cache
                                  url="/system/data/select.json"
                                  fields={['dictKey', 'dictName']}
                                  onChange={() => {
                                    form2.setFieldValue(
                                      ['rangeDatas', item.index, 'code'],
                                      null,
                                    );
                                  }}
                                />
                              ),
                            },
                            {
                              title: '数据名称',
                              dataIndex: 'code',
                              formItemRender: (item, _, form) => {
                                const type = form.getFieldValue([
                                  'rangeDatas',
                                  item.index,
                                  'type',
                                ]);

                                if (type) {
                                  return (
                                    <SelectList
                                      cache
                                      key={type}
                                      url="/system/data/select/result.json"
                                      params={{ dataCode: type }}
                                      fields={['dictKey', 'dictName']}
                                    />
                                  );
                                }
                              },
                            },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              ),
          ]}
        />
      </DrawerBox>
    </>
  );
};
