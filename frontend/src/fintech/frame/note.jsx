import {
  CheckCircleTwoTone,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Alert, Button, Input, List, Typography } from 'antd';
import { LinkBtn, fileController, storageSQL } from 'fintech';
import { useEffect, useRef, useState } from 'react';

const SQL_TABLE = 'note';

export default () => {
  const inputRef = useRef(null);
  const [dataSource, setDataSource] = useState([]);
  const [editId, setEditId] = useState(undefined);
  const [value, setValue] = useState('');

  const onSubmit = () => {
    storageSQL('duplicate', {
      from: SQL_TABLE,
      where: `id=${editId}`,
      values: { content: value, id: editId },
    })(() => {
      setValue('');
      setEditId(undefined);
      query();
    });
  };

  const query = () => {
    setDataSource(storageSQL('select', { from: SQL_TABLE }));
  };

  const backup = () => {
    const note = localStorage['note'];

    if (note && note !== '[]') {
      const url = fileController.write({
        text: note,
      });
      fileController.download({
        url,
        filename: '笔记_备份.json',
      });
    }
  };

  useEffect(() => {
    query();
  }, []);

  return (
    <>
      <Alert
        style={{ marginBottom: 8 }}
        title={
          <>
            <Typography.Title level={5} mark style={{ marginTop: 8 }}>
              使用注意!!!
            </Typography.Title>
            <Typography.Paragraph>
              <ul>
                <li>
                  该笔记功能是本地功能，数据都是存储在当前浏览器中，不能跨设备、跨浏览器共享数据，请不要存储重要的数据。
                </li>
                <li>
                  当使用浏览器的数据清理功能时，该笔记的数据也会被删除，请注意使用情况。
                </li>
                <li>
                  你可以 <LinkBtn onClick={backup}>备份</LinkBtn>{' '}
                  笔记数据，然后在需要的时候{' '}
                  <LinkBtn onClick={() => inputRef.current?.click()}>
                    恢复
                  </LinkBtn>{' '}
                  笔记数据。{' '}
                </li>
              </ul>
            </Typography.Paragraph>
          </>
        }
      />
      <Input.TextArea
        rows={6}
        value={value}
        placeholder="请输入笔记内容，数据存储于浏览器中"
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="primary" size="small" block onClick={onSubmit}>
        提交
      </Button>
      <List
        dataSource={dataSource}
        renderItem={(item) => (
          <List.Item
            actions={[
              <LinkBtn
                key="e"
                onClick={() => {
                  setEditId(item.id);
                  setValue(item.content);
                }}
              >
                <EditOutlined />
              </LinkBtn>,
              <LinkBtn
                key="d"
                title="删除"
                color="red"
                content="确定删除该笔记？"
                onOk={() => {
                  storageSQL('delete', {
                    from: SQL_TABLE,
                    where: `id=${item.id}`,
                  })(query);
                }}
              >
                <DeleteOutlined />
              </LinkBtn>,
              <LinkBtn
                key="s"
                color="red"
                title="完成"
                content="确定完成该笔记？"
                onOk={() => {
                  storageSQL('duplicate', {
                    from: SQL_TABLE,
                    where: `id=${item.id}`,
                    values: { id: item.id, state: 'succ' },
                  })(query);
                }}
              >
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              </LinkBtn>,
            ]}
          >
            {item.state === 'succ' ? (
              <s>
                <pre>{item.content}</pre>
              </s>
            ) : (
              <pre>{item.content}</pre>
            )}
          </List.Item>
        )}
      />
      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        accept="application/json"
        onChange={(e) => {
          fileController.read(e.target.files[0]).then((res) => {
            try {
              const json = JSON.parse(res);
              localStorage.setItem('note', JSON.stringify(json));
              query();
            } catch (e) {
              console.log(e);
            }
            // 防止二次上传失败的问题
            e.target.value = '';
          });
        }}
      />
    </>
  );
};
