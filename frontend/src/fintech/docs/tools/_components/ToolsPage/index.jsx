import {
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Tabs } from 'antd';
import React from 'react';
import Qrcode from '../../../../frame/qrcode';
import Demo1 from '../excel/demo1';
import Demo3 from '../excel/demo3';
import Tool from '../tool';
import './style.less';

const tools = [
  {
    key: 'screen-utils',
    icon: ToolOutlined,
    title: '工具',
    description: '录屏与屏幕取色，覆盖日常联调与走查场景。',
    meta: 'Screen Utils',
    content: <Tool />,
  },
  {
    key: 'qr-codec',
    icon: QrcodeOutlined,
    title: '二维码生成和解析',
    description: '支持长文本自动分片与 SM4 加解密的二维码工具。',
    meta: 'QR Codec',
    content: <Qrcode />,
  },
  {
    key: 'permission-workbench',
    icon: SafetyCertificateOutlined,
    title: '权限表工作台',
    description:
      '选择内置权限文件，编辑权限树并导出 JSON、Oracle 或 MySQL SQL。',
    meta: 'JSON / SQL',
    content: <Demo1 />,
  },
  {
    key: 'excel-json',
    icon: SwapOutlined,
    title: '数据转化',
    description: '可以方便的导出 excel 列表中的数据。',
    meta: 'Excel to JSON',
    content: <Demo3 />,
  },
];

export default function ToolsPage() {
  const [activeKey, setActiveKey] = React.useState(tools[0].key);

  return (
    <div className="fintech-tools">
      <section className="fintech-tools__hero">
        <div className="fintech-tools__container">
          <div className="fintech-tools__hero-row">
            <div className="fintech-tools__eyebrow">
              <span className="fintech-tools__eyebrow-dot" />
              FINTECH TOOLBOX
            </div>
            <div className="fintech-tools__hero-copy">
              <h1>
                开发小工具，<span>随取随用。</span>
              </h1>
              <p className="fintech-tools__hero-description">
                录屏取色、二维码编解码、权限 SQL 生成与表格数据转化。
              </p>
            </div>
            <span className="fintech-tools__tool-count">
              {tools.length} 个工具
            </span>
          </div>
        </div>
      </section>

      <section className="fintech-tools__section">
        <div className="fintech-tools__container">
          <div className="fintech-tools__workspace">
            <Tabs
              className="fintech-tools__tabs"
              activeKey={activeKey}
              onChange={setActiveKey}
              items={tools.map(
                ({ key, icon: Icon, title, meta, description, content }) => ({
                  key,
                  label: (
                    <span className="fintech-tools__tab-label">
                      <span className="fintech-tools__tab-icon">
                        <Icon />
                      </span>
                      <span className="fintech-tools__tab-text">
                        <span className="fintech-tools__tab-title">
                          {title}
                        </span>
                        <span className="fintech-tools__tab-meta">{meta}</span>
                      </span>
                    </span>
                  ),
                  children: (
                    <article className="fintech-tools__panel">
                      <header className="fintech-tools__panel-head">
                        <div className="fintech-tools__panel-icon">
                          <Icon />
                        </div>
                        <div>
                          <h2>{title}</h2>
                          <p>{description}</p>
                        </div>
                      </header>
                      <div className="fintech-tools__panel-body">{content}</div>
                    </article>
                  ),
                }),
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
