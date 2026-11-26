import { Divider, message, Switch, Tag } from 'antd';
import { cloneElement, useRef, useState } from 'react';
import DrawerBox from '../DrawerBox';
import FormSchema from '../FormItem/schema';
import LinkBtn from '../LinkBtn';
import ProTableAsync from '../ProTableAsync';
import { testLLMConfigConnection } from './client';
import {
  deleteLLMConfig,
  enableLLMConfig,
  getLLMConfigList,
  saveLLMConfig,
} from './storage';

const LLMConfigDrawer = ({ children }) => {
  const drawerRef = useRef(null);
  const [configList, setConfigList] = useState([]);
  const [testingId, setTestingId] = useState(null);

  const refreshConfigList = () => {
    setConfigList(getLLMConfigList());
  };

  const handleToggleEnabled = async (item, checked) => {
    if (checked) {
      enableLLMConfig(item.id || '');
      refreshConfigList();
      message.success(`已启用 ${item.name || item.model || '当前 LLM'}`);
      return;
    }

    saveLLMConfig({
      ...item,
      enabled: false,
    });
    refreshConfigList();
    message.success(`已关闭 ${item.name || item.model || '当前 LLM'}`);
  };

  const handleDelete = (item) => {
    deleteLLMConfig(item.id || '');
    refreshConfigList();
    message.success('LLM 配置已删除');
  };

  const getTestStatusTag = (status) => {
    if (status === 'success') {
      return <Tag color="success">成功</Tag>;
    }

    if (status === 'failure') {
      return <Tag color="error">失败</Tag>;
    }

    return <Tag>未测试</Tag>;
  };

  const handleTestConnection = async (item) => {
    const currentTestingId = item.id || item.name || item.model || item.baseUrl;
    setTestingId(currentTestingId);

    try {
      const { content } = await testLLMConfigConnection(item);
      const nextItem = {
        ...item,
        testStatus: 'success',
      };
      saveLLMConfig(nextItem);
      refreshConfigList();
      const preview = String(content || '')
        .trim()
        .slice(0, 80);
      message.success(preview ? `测试成功：${preview}` : '测试成功');
    } catch (error) {
      saveLLMConfig({
        ...item,
        testStatus: 'failure',
      });
      refreshConfigList();
      message.error(error?.message || '测试失败');
    } finally {
      setTestingId(null);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: 'Model',
      dataIndex: 'model',
    },
    {
      width: 450,
      title: 'Base URL',
      dataIndex: 'baseUrl',
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      render: (_, item) => (
        <Switch
          checked={Boolean(item.enabled)}
          checkedChildren="开启"
          unCheckedChildren="关闭"
          onChange={(checked) => handleToggleEnabled(item, checked)}
        />
      ),
    },
    {
      title: '测试状态',
      dataIndex: 'testStatus',
      render: (value) => getTestStatusTag(value),
    },
    {
      width: 200,
      valueType: 'option',
      render: (_, item) => [
        <LinkBtn
          key="copy"
          onClick={() => {
            const { id, ...rest } = item;
            drawerRef.current?.form?.setFieldsValue(rest);
          }}
        >
          复制
        </LinkBtn>,
        <LinkBtn
          key="edit"
          onClick={() => {
            drawerRef.current?.form?.setFieldsValue(item);
          }}
        >
          编辑
        </LinkBtn>,
        <LinkBtn
          key="test"
          loading={
            testingId === (item.id || item.name || item.model || item.baseUrl)
          }
          onClick={() => handleTestConnection(item)}
        >
          测试连接
        </LinkBtn>,
        <LinkBtn
          key="delete"
          color="red"
          title="删除"
          content={`删除后将无法恢复：${item.name || item.model || '当前 LLM'}`}
          onOk={() => handleDelete(item)}
        >
          删除
        </LinkBtn>,
      ],
    },
  ];

  const triggerNode = children ? (
    cloneElement(children, {
      onClick: (event) => {
        children.props?.onClick?.(event);
        drawerRef.current?.open?.(true);
      },
    })
  ) : (
    <LinkBtn variant="solid" onClick={() => drawerRef.current?.open?.(true)}>
      LLM 配置
    </LinkBtn>
  );

  return (
    <>
      {triggerNode}
      <DrawerBox
        form={{ layout: 'vertical' }}
        title="LLM 配置"
        size="85%"
        actionRef={drawerRef}
        onOk={({ values }) => {
          saveLLMConfig(values);
          refreshConfigList();
          drawerRef.current?.form?.resetFields();
          message.success(values.id ? 'LLM 配置已更新' : 'LLM 配置已新增');
        }}
        afterOpen={() => {
          refreshConfigList();
          drawerRef.current?.form?.resetFields();
        }}
      >
        <ProTableAsync
          ghost
          headerTitle={false}
          search={false}
          pagination={false}
          columns={columns}
          dataSource={configList}
          locale={{
            emptyText: '暂无 LLM，请在下方新增',
          }}
        />
        <Divider />
        <FormSchema
          gutter={12}
          colSpan={12}
          unique="id"
          items={[
            {
              name: 'name',
              label: '名称',
            },
            {
              name: 'model',
              label: 'Model',
            },
            {
              name: 'baseUrl',
              label: 'Base URL',
            },
            {
              name: 'apiKey',
              label: 'API Key',
              valueType: 'password',
            },
          ]}
        />
      </DrawerBox>
    </>
  );
};

export default LLMConfigDrawer;
