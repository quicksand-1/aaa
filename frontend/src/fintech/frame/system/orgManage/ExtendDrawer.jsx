import { message } from 'antd';
import { DrawerBox, FormSchema, LinkBtn, request } from 'fintech';
import { useRef, useState } from 'react';

export default (props) => {
  const { data } = props;

  const drawerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fieldList, setFieldList] = useState([]);
  const [fieldEnumObj, setFieldEnumObj] = useState({});

  return (
    <>
      <LinkBtn
        hidden={!(data.orgType?.code === 'AST')}
        onClick={() => drawerRef.current?.open(true)}
      >
        拓展
      </LinkBtn>
      <DrawerBox
        form
        title="拓展编辑"
        actionRef={drawerRef}
        confirmLoading={loading}
        onOk={({ values, open }) => {
          request('/org/updateExtInf.json', {
            setLoading,
            method: 'POST',
            data: values,
          }).then(() => {
            open(false);
            message.success('保存成功');
          });
        }}
        afterOpen={({ form }) => {
          request('/dict/ORG_ROUTE_BEAN.json')
            .then((res) => {
              setFieldList(res);
              return res.map((i) => i.dictKey);
            })
            .then((res) => {
              request('/dict/queryBylist.json', {
                method: 'POST',
                data: { typeList: res },
              }).then((res2) => {
                setFieldEnumObj(res2);
              });
            });

          request('/org/get.json', {
            setLoading,
            params: { orgCode: data.orgCode },
          }).then(({ extInf }) => {
            form.setFieldsValue({
              ...extInf,
              orgCode: data.orgCode,
            });
          });
        }}
      >
        <FormSchema
          unique="orgCode"
          items={fieldList.map((i) => ({
            name: i.dictKey,
            label: i.dictName,
            valueType: 'select',
            valueEnum: fieldEnumObj[i.dictKey],
            inputProps: { fields: ['dictKey', 'dictName'] },
            required: i.dictKey !== 'DATAX_CONFIG_GEN',
          }))}
        />
      </DrawerBox>
    </>
  );
};
