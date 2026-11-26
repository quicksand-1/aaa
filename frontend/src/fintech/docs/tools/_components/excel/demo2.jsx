import { CopyOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Flex, Space, message } from 'antd';
import { Excel2Json, SelectList, clipboard } from 'fintech';
import { useState } from 'react';

export default () => {
  const [data, setData] = useState({});
  const [sql, setSql] = useState('');

  return (
    <Flex vertical gap={12}>
      <Space wrap>
        <Excel2Json
          templateUrl="template/GENERAL_SYS_ROLE_MENU.xlsx"
          onFinish={(res) => {
            setData(res);
          }}
        >
          <Button type="primary" icon={<UploadOutlined />}>
            提交表格
          </Button>
        </Excel2Json>
        <SelectList
          style={{ width: 200 }}
          placeholder="需要生成 SQL 的 sheet"
          options={Object.keys(data)}
          onChange={(key) => {
            const res = data[key];

            const string = res.reduce((p, item) => {
              if (item.MENU_CODE) {
                return `${p} INSERT INTO GENERAL_SYS_ROLE_MENU (ID, MENU_CODE, ROLE_CODE, GMT_CREATE) VALUES (${item.ID}, '${item.MENU_CODE}', 'administrator', sysdate);\n`;
              }
              return p;
            }, '');

            setSql(string);
          }}
        />
        <Button
          icon={<CopyOutlined />}
          disabled={!sql}
          onClick={() => {
            clipboard.copy(sql).then(() => {
              message.success('已复制');
            });
          }}
        >
          复制SQL
        </Button>
      </Space>
      {sql && (
        <pre
          style={{
            width: '100%',
            margin: 0,
            padding: 12,
            borderRadius: 8,
            border: '1px solid rgba(5, 5, 5, 0.06)',
            overflow: 'auto',
          }}
        >
          {sql}
        </pre>
      )}
    </Flex>
  );
};
