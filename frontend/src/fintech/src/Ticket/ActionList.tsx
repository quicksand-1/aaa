import { Modal, message } from 'antd';
import { cloneElement, isValidElement, useEffect, useState } from 'react';
import ActionsContainer from '../ActionsContainer';
import request from '../fetch/request';
import LinkBtn from '../LinkBtn';

const ACTION_TONE = {
  撤销: { color: 'default', variant: 'outlined' },
  通过: { color: 'primary', variant: 'solid' },
  拒绝: { color: 'red', variant: 'solid' },
};

const renderActions = ({ actions = [], defaultActions = {} }) => {
  return (actions || []).map((item, index) => {
    if (typeof item === 'string' && defaultActions[item]) {
      return cloneElement(defaultActions[item], {
        key: item,
      });
    }

    if (isValidElement(item)) {
      return cloneElement(item, {
        key: item.key || `action-${index}`,
      });
    }

    return item;
  });
};

export default ({
  businessKey,
  businessType,
  callback = () => {},
  confirmLoading = false,
  actions = ['ok'],
  form,
  okButtonProps = {},
  okText = '提交审批',
  onOk = () => {},
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = () => {
    request('/workOrder/btn.json', {
      params: { businessKey, businessType },
    }).then((res = []) => {
      setData(res);
    });
  };

  useEffect(() => {
    if (businessKey && businessType) {
      query();
    }
  }, [businessKey, businessType]);

  const formActions = renderActions({
    actions,
    defaultActions: {
      ok: (
        <LinkBtn
          color="primary"
          variant="solid"
          loading={confirmLoading}
          onClick={() => {
            form.validateFields().then((values) => {
              Modal.confirm({
                title: '操作确认',
                content: '确定提交审批吗？',
                onOk: onOk.bind(null, values),
              });
            });
          }}
          {...okButtonProps}
        >
          {okText}
        </LinkBtn>
      ),
    },
  });

  const ticketActions = data.map((btn) => {
    const tone = ACTION_TONE[btn.btnName] || {
      color: 'default',
      variant: 'outlined',
    };

    return (
      <LinkBtn
        key={btn.btnName}
        color={tone.color}
        variant={tone.variant}
        loading={loading}
        title={btn.btnName}
        content={`确定进行${btn.btnName}操作吗？`}
        onOk={() => {
          request(btn.btnUrl, { setLoading }).then(() => {
            message.success(`已${btn.btnName}`);
            query();
            callback();
          });
        }}
      >
        {btn.btnName}
      </LinkBtn>
    );
  });

  if (businessKey && ticketActions.length === 0) {
    return null;
  }

  return (
    <ActionsContainer actions={businessKey ? ticketActions : formActions} />
  );
};
