import { Flex, Spin } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import request from '../fetch/request';
import styles from './style';

const getNodeMeta = (node, data) => {
  if (node.nodeCode === 'start') {
    return {
      detail: `执行人：${data.applyUserName || '--'}`,
      time: data.gmtCreate,
    };
  }

  if (node.nodeCode === 'end') {
    return {
      detail: node.over ? '流程结束' : '等待流程完成',
      time: node.gmtEnd || '--',
    };
  }

  if (node.over) {
    return {
      detail: `执行人：${node.nodeApprovalUser || '--'}`,
      time: node.gmtEnd,
    };
  }

  return {
    detail: `审批组：${
      node.candidateList?.map((user) => user.firstName).join('、') || '--'
    }`,
    time: '等待处理',
  };
};

const getNodeTone = (node) => {
  if (node.over) {
    return {
      dot: 'bg-emerald-500',
      line: 'bg-emerald-200',
      card: 'border-emerald-200 bg-emerald-50/80',
      title: 'text-emerald-700',
    };
  }

  if (node.nodeCode === 'start') {
    return {
      dot: 'bg-sky-500',
      line: 'bg-sky-200',
      card: 'border-sky-200 bg-sky-50/80',
      title: 'text-sky-700',
    };
  }

  if (node.current) {
    return {
      dot: 'bg-amber-500',
      line: 'bg-amber-200',
      card: 'border-amber-200 bg-amber-50/80',
      title: 'text-amber-700',
    };
  }

  return {
    dot: 'bg-slate-300',
    line: 'bg-slate-200',
    card: 'border-slate-200 bg-slate-50/80',
    title: 'text-slate-600',
  };
};

const getNodeStatusText = (node) => {
  if (node.over) {
    return '已完成';
  }

  if (node.nodeCode === 'start') {
    return '已发起';
  }

  if (node.current) {
    return '处理中';
  }

  return '待处理';
};

export default forwardRef(({ businessKey }: any, ref) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const query = () => {
    request('/workOrder/details.json', {
      setLoading,
      params: { businessKey },
    }).then((res = {}) => {
      setData(res);
    });
  };

  useEffect(() => {
    if (businessKey) {
      query();
    }
  }, [businessKey]);

  // 提供给外部的接口
  useImperativeHandle(ref, () => ({
    reload: query,
  }));

  if (businessKey) {
    const nodeList = data.nodeList || [];

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={styles.sidebarHeader}>
          <div className="text-sm font-semibold text-slate-900">审批进度</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">
            查看当前工单的流转节点与处理情况。
          </div>
        </div>
        <Spin spinning={loading}>
          <div className={styles.nodeList}>
            {nodeList.length ? (
              <div className="space-y-4">
                {nodeList.map((node, index) => {
                  const tone = getNodeTone(node);
                  const meta = getNodeMeta(node, data);

                  return (
                    <div
                      key={`${node.nodeCode}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="flex w-5 flex-col items-center">
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot}`}
                        />
                        {index < nodeList.length - 1 && (
                          <span
                            className={`mt-1 min-h-10 w-px flex-1 ${tone.line}`}
                          />
                        )}
                      </div>
                      <div
                        className={`flex-1 rounded-2xl border px-3 py-3 ${tone.card}`}
                      >
                        <Flex
                          align="center"
                          justify="space-between"
                          gap="small"
                        >
                          <div className={`text-sm font-medium ${tone.title}`}>
                            {node.nodeName}
                          </div>
                          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-slate-500">
                            {getNodeStatusText(node)}
                          </span>
                        </Flex>
                        <div className="mt-2 text-xs leading-5 text-slate-600">
                          {meta.detail}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400">
                          {meta.time || '--'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.nodeEmpty}>
                当前工单没有可展示的审批节点。
              </div>
            )}
          </div>
        </Spin>
      </div>
    );
  }

  return null;
});
