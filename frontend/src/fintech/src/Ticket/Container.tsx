/**
 * 1、配合 TicketDrawer 中的 iframe 来使用，在需要审批的页面正常包裹组件即可
 * 2、需要在 config/routes.ts 配置专门审批的路由，如：
 *    {
 *      path: 'ENTITY_BINDING', // 工单业务类型
 *      name: '子账绑定',
 *      component: './books/ledger/edit', // 被该组件包裹的编辑页面
 *      hideInMenu: true,
 *      headerRender: false,
 *      footerRender: false,
 *      menuRender: false,
 *      hideInBreadcrumb: true,
 *    }
 * @API
 *   okText<string>: 提交按钮名称
 *   onOk<() => void>: 提交按钮事件
 *   okButtonProps<ButtonProps>: 提交按钮属性
 *   confirmLoading<boolean>：loading 状态
 *   actions<['ok']>: 头部右侧操作区
 *   ticketKey<string>: 缓存key，配合 (bizStorage | ticketStorage).set 来使用
 *   height<string | number>: 容器高度
 *   layout<'auto' | 'drawer' | 'fullscreen'>: 容器布局模式
 *   callback<(type, data) => void>: 页面渲染回调函数，不同情况有不同的参数
 *     form<type>：页面编辑情况，data 中包含如下属性
 *       - form：表单对象
 *       - urlParams：地址栏 url 参数
 *       - originBizData：对应业务场景的业务数据
 *     ticket<type>: 审批页面，默认会将 data 数据回显至页面，如果该回调函数返回 true，则不默认执行表单回显
 *       - data: 对应业务提交时的入参数据
 *       - snap: 自定义数据，一般在 form 阶段把 originBizData 提交给后端
 *       - form：表单对象
 *       - urlParams：地址栏 url 参数
 *       - originBizData：对应业务场景的业务数据
 * */

import type { ButtonProps } from 'antd';
import { Flex, Form, Spin } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import request from '../fetch/request';
import StatusTag from '../StatusTag';
import getUrlParams from '../utils/getUrlParams';
import ActionList from './ActionList';
import NodeList from './NodeList';
import statusEnum from './statusEnum';
import storage from './storage';
import styles from './style';

const parse = (v = '') => {
  try {
    return JSON.parse(v);
  } catch (e) {
    return v;
  }
};

const getContainerHeight = (
  height: CSSProperties['height'],
  businessKey?: string,
  layout = 'auto',
) => {
  if (height !== undefined) {
    return { height };
  }

  if (layout === 'fullscreen') {
    return { height: '100dvh' };
  }

  if (layout === 'drawer') {
    return { height: '100%' };
  }

  try {
    if (layout === 'auto' && window.self !== window.top) {
      return { height: '100%' };
    }
  } catch (e) {
    return { height: '100%' };
  }

  return {
    minHeight: businessKey ? 680 : 560,
  };
};

type TicketContainerProps = {
  children?: ReactNode;
  okText?: string;
  onOk?: (res?: any) => void;
  okButtonProps?: ButtonProps;
  confirmLoading?: boolean;
  actions?: any[];
  callback?: (type: string, data: any) => unknown;
  ticketKey?: string;
  height?: CSSProperties['height'];
  layout?: 'auto' | 'drawer' | 'fullscreen';
};

export default (props: TicketContainerProps) => {
  const {
    children,
    okText = '提交审批',
    onOk = () => {},
    okButtonProps = {},
    confirmLoading = false,
    actions = ['ok'],
    callback = () => {},
    ticketKey,
    height,
    layout = 'auto',
  } = props;

  const nodeRef = useRef(null);
  const [ticketInfo, setTicketInfo] = useState(storage.get());
  const [loading, setLoading] = useState(false);
  const [formInstance] = Form.useForm();
  const { businessKey, businessType, workOrdName, currentApprovalStatus } =
    ticketInfo;
  const containerHeight = getContainerHeight(height, businessKey, layout);

  /**
   * 渲染时获取 storage 信息
   * */
  useEffect(() => {
    const urlParams = getUrlParams();
    const { bizData: originBizData } =
      ticketKey && storage.getOriginBizData(ticketKey);
    if (businessKey) {
      request('/workOrder/detail.json', {
        setLoading,
        params: { businessKey },
      }).then((dataObject) => {
        const detail = Array.isArray(dataObject) ? dataObject[0] : dataObject;
        const { data, snap, ...res } = detail || {};
        const d = parse(data);

        setTicketInfo((prev) => ({
          ...prev,
          ...res,
        }));

        const result = callback('ticket', {
          ...res,
          data: d,
          snap: parse(snap),
          form: formInstance,
          urlParams,
          originBizData,
        });
        // 如果返回 true，则不自动进行表单回显
        if (!result) {
          formInstance.setFieldsValue(d);
        }
      });
    } else {
      callback('form', { form: formInstance, urlParams, originBizData });
    }
  }, []);

  return (
    <Spin spinning={confirmLoading} description="内容提交中...">
      <div className={styles.container} style={containerHeight}>
        <div className={styles.header}>
          <Flex align="center" gap="middle" justify="space-between" wrap>
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {businessKey ? workOrdName || '审批详情' : '发起审批'}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-500">
                {businessKey ? `工单号 ${businessKey}` : '请确认信息后发起审批'}
              </div>
              {businessKey && currentApprovalStatus && (
                <StatusTag
                  value={currentApprovalStatus}
                  valueEnum={statusEnum}
                />
              )}
            </div>
            <Flex justify="end" wrap gap="small">
              <ActionList
                businessKey={businessKey}
                businessType={businessType}
                callback={() => {
                  nodeRef.current?.reload?.();
                }}
                confirmLoading={confirmLoading}
                actions={actions}
                form={formInstance}
                okButtonProps={okButtonProps}
                okText={okText}
                onOk={onOk}
              />
            </Flex>
          </Flex>
        </div>
        <div className={styles.layout}>
          {businessKey && currentApprovalStatus !== '无审批' && (
            <div className={styles.sidebar}>
              <div className={styles.sidebarPanel}>
                <div className={styles.sidebarHeader}>
                  <div className="text-sm font-semibold text-slate-900">
                    审批信息
                  </div>
                  <div className={styles.sidebarCard}>
                    <div className="text-xs text-slate-500">工单类型</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                      {businessType || '--'}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">处理提示</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">
                      请结合审批进度和表单内容完成当前处理。
                    </div>
                  </div>
                </div>
                <NodeList ref={nodeRef} businessKey={businessKey} />
              </div>
            </div>
          )}

          <div className={styles.content}>
            <Spin spinning={loading}>
              <Form form={formInstance} className="min-h-full">
                <div className={styles.formBody}>{children}</div>
              </Form>
            </Spin>
          </div>
        </div>
      </div>
    </Spin>
  );
};
