import {
  ApartmentOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Empty,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tree,
  Typography,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createPermissionSql,
  filterPermissionTree,
  filterPermissionTreeByPlatform,
  flattenPermissionTree,
  insertPermissionNode,
  movePermissionNode,
  normalizePermissionTree,
  removePermissionNode,
  serializePermissionTree,
  updatePermissionNode,
  validatePermissionTree,
} from './permissionTable';

const downloadText = (content, filename, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const PERMISSION_FILES = [
  '会计核算.json',
  '数据治理平台.json',
  '资金方平台.json',
  '知识库.json',
  '资产转让.json',
].map((value) => ({ value, label: value.replace(/\.json$/i, '') }));

const readPermissionFile = async (filename) => {
  const response = await fetch(`/权限码/${encodeURIComponent(filename)}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return normalizePermissionTree(await response.json());
};

const PermissionField = ({ ariaLabel, onCommit, value, ...props }) => {
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  return (
    <Input
      {...props}
      aria-label={ariaLabel}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== (value ?? '')) onCommit(draft);
      }}
    />
  );
};

export default () => {
  const [data, setData] = useState([]);
  const [filename, setFilename] = useState('');
  const [reading, setReading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [sqlConfig, setSqlConfig] = useState(null);
  const treeRef = useRef(null);

  const rows = useMemo(() => flattenPermissionTree(data), [data]);
  const visibleData = useMemo(
    () => filterPermissionTree(data, keyword),
    [data, keyword],
  );
  const issues = useMemo(() => validatePermissionTree(data), [data]);
  const issueFields = useMemo(
    () => new Set(issues.map(({ id, field }) => `${id}:${field}`)),
    [issues],
  );
  const platformOptions = useMemo(
    () => [
      ...new Set(
        rows.flatMap(({ plf }) =>
          plf
            .split('|')
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ),
    ],
    [rows],
  );
  const platforms = platformOptions.length;
  const maxDepth = Math.max(0, ...rows.map(({ depth }) => depth));

  const changeData = (next) => {
    setData(next);
    setDirty(true);
  };

  const addNode = (targetId, position) => {
    const next = insertPermissionNode(data, targetId, position);
    const currentIds = new Set(rows.map(({ id }) => id));
    const added = flattenPermissionTree(next).find(
      ({ id }) => !currentIds.has(id),
    );
    changeData(next);
    if (targetId && position === 'child') {
      setExpandedKeys((keys) => [...new Set([...keys, targetId])]);
    }
    requestAnimationFrame(() => {
      if (added) treeRef.current?.scrollTo?.({ key: added.id, align: 'auto' });
    });
  };

  const updateNode = (id, patch) =>
    changeData(updatePermissionNode(data, id, patch));

  const exportJson = () => {
    if (issues.length) return message.error('请先修复空权限码或空名称');
    downloadText(
      `${JSON.stringify(serializePermissionTree(data), null, 2)}\n`,
      filename.toLowerCase().endsWith('.json') ? filename : 'permissions.json',
      'application/json;charset=utf-8',
    );
    setDirty(false);
    message.success('JSON 已导出');
  };

  const openSqlExport = () => {
    if (issues.length) return message.error('请先修复空权限码或空名称');
    setSqlConfig({
      dialect: 'oracle',
      platform: undefined,
    });
  };

  const titleRender = (node) => (
    <div
      className="permission-workbench__row"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="permission-workbench__cell permission-workbench__cell--plf">
        <span className="permission-workbench__mobile-label">平台</span>
        <PermissionField
          aria-label={`${node.title} 平台`}
          placeholder="全部平台"
          value={node.plf}
          variant="borderless"
          onCommit={(value) => updateNode(node.id, { plf: value })}
        />
      </div>
      <div className="permission-workbench__cell permission-workbench__cell--key">
        <span className="permission-workbench__mobile-label">权限码</span>
        <PermissionField
          aria-label={`${node.title} 权限码`}
          status={issueFields.has(`${node.id}:key`) ? 'error' : undefined}
          value={node.permissionKey}
          variant="borderless"
          onCommit={(value) => updateNode(node.id, { permissionKey: value })}
        />
      </div>
      <div className="permission-workbench__cell permission-workbench__cell--title">
        <span className="permission-workbench__mobile-label">名称</span>
        <PermissionField
          aria-label={`${node.permissionKey} 名称`}
          status={issueFields.has(`${node.id}:title`) ? 'error' : undefined}
          value={node.title}
          variant="borderless"
          onCommit={(value) => updateNode(node.id, { title: value })}
        />
      </div>
      <div className="permission-workbench__cell permission-workbench__cell--type">
        <span className="permission-workbench__mobile-label">层级</span>
        <PermissionField
          aria-label={`${node.title} 层级`}
          value={node.type}
          variant="borderless"
          onCommit={(value) => updateNode(node.id, { type: value })}
        />
      </div>
      <Space className="permission-workbench__actions" size={2}>
        <Button
          aria-label={`在 ${node.title} 下添加子权限`}
          icon={<ApartmentOutlined />}
          size="small"
          type="text"
          onClick={() => addNode(node.id, 'child')}
        />
        <Button
          aria-label={`在 ${node.title} 后添加权限`}
          icon={<PlusOutlined />}
          size="small"
          type="text"
          onClick={() => addNode(node.id, 'after')}
        />
        <Popconfirm
          title="删除此权限及其全部子权限？"
          okButtonProps={{ danger: true }}
          okText="删除"
          cancelText="取消"
          onConfirm={() => changeData(removePermissionNode(data, node.id))}
        >
          <Button
            aria-label={`删除 ${node.title}`}
            danger
            icon={<DeleteOutlined />}
            size="small"
            type="text"
          />
        </Popconfirm>
      </Space>
    </div>
  );

  const sqlTree = sqlConfig
    ? filterPermissionTreeByPlatform(data, sqlConfig.platform)
    : [];
  const sqlRows = flattenPermissionTree(sqlTree);
  const sqlContent = sqlConfig
    ? createPermissionSql(data, sqlConfig.dialect, sqlConfig.platform)
    : '';

  return (
    <div className="permission-workbench">
      <div className="permission-workbench__toolbar">
        <Select
          className="permission-workbench__file-select"
          loading={reading}
          options={PERMISSION_FILES}
          placeholder="选择权限文件"
          value={filename || undefined}
          onChange={async (value) => {
            setReading(true);
            try {
              const next = await readPermissionFile(value);
              setData(next);
              setFilename(value);
              setDirty(false);
              setExpandedKeys(next.map(({ id }) => id));
              message.success(`已读取 ${value}`);
            } catch (error) {
              message.error(`文件读取失败：${error.message}`);
            } finally {
              setReading(false);
            }
          }}
        />
        <Input
          allowClear
          aria-label="搜索权限"
          className="permission-workbench__search"
          placeholder="搜索权限码、名称或平台"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <div className="permission-workbench__toolbar-spacer" />
        <Button
          disabled={!data.length}
          icon={<FileTextOutlined />}
          onClick={exportJson}
        >
          导出 JSON
        </Button>
        <Button
          disabled={!data.length}
          icon={<DownloadOutlined />}
          onClick={openSqlExport}
        >
          导出 SQL
        </Button>
      </div>

      <div className="permission-workbench__summary">
        <div>
          <Typography.Text strong>
            {filename || '未选择权限文件'}
          </Typography.Text>
          {dirty && <Tag color="gold">有未导出修改</Tag>}
        </div>
        <Space
          wrap
          separator={<span className="permission-workbench__divider" />}
        >
          <Typography.Text type="secondary">
            {rows.length} 条权限
          </Typography.Text>
          <Typography.Text type="secondary">{platforms} 个平台</Typography.Text>
          <Typography.Text type="secondary">{maxDepth} 级结构</Typography.Text>
          {!!issues.length && (
            <Typography.Text type="danger">
              {issues.length} 处待修复
            </Typography.Text>
          )}
        </Space>
      </div>

      <div className="permission-workbench__table-head" aria-hidden="true">
        <span>平台 / plf</span>
        <span>权限码 / key</span>
        <span>名称 / title</span>
        <span>层级 / type</span>
        <span>操作</span>
      </div>

      <div className="permission-workbench__tree-wrap">
        {!data.length ? (
          <Empty description={<span>从上方选择一个权限文件开始编辑</span>} />
        ) : (
          <Tree
            blockNode
            draggable={!keyword}
            expandedKeys={
              keyword
                ? flattenPermissionTree(visibleData).map(({ id }) => id)
                : expandedKeys
            }
            fieldNames={{ key: 'id', children: 'children' }}
            ref={treeRef}
            selectable={false}
            showLine={{ showLeafIcon: false }}
            titleRender={titleRender}
            treeData={visibleData}
            virtual={false}
            onExpand={setExpandedKeys}
            onDrop={(info) => {
              const dropPosition =
                info.dropPosition - Number(info.node.pos.split('-').at(-1));
              changeData(
                movePermissionNode(
                  data,
                  info.dragNode.id,
                  info.node.id,
                  dropPosition,
                  info.dropToGap,
                ),
              );
            }}
          />
        )}
      </div>

      <Typography.Paragraph
        className="permission-workbench__hint"
        type="secondary"
      >
        拖动行可调整顺序或层级；行尾按钮可添加子权限、同级权限或删除。搜索时暂停拖动。
      </Typography.Paragraph>

      <Modal
        destroyOnHidden
        open={!!sqlConfig}
        title="导出 SQL"
        width={900}
        cancelText="关闭"
        okText="下载 .sql 文件"
        onCancel={() => setSqlConfig(null)}
        onOk={() => {
          const dialect = sqlConfig.dialect;
          const platformName = sqlConfig.platform || 'all';
          const baseName = filename.replace(/\.json$/i, '') || 'permissions';
          downloadText(
            sqlContent,
            `${baseName}.${platformName}.${dialect}.sql`,
            'text/sql;charset=utf-8',
          );
          setSqlConfig(null);
          message.success('SQL 已导出');
        }}
      >
        <div className="permission-workbench__sql-config">
          <label>
            <span>数据库</span>
            <Select
              value={sqlConfig?.dialect}
              options={[
                { value: 'oracle', label: 'Oracle' },
                { value: 'mysql', label: 'MySQL' },
              ]}
              onChange={(dialect) =>
                setSqlConfig((current) => ({ ...current, dialect }))
              }
            />
          </label>
          <label>
            <span>平台 / plf</span>
            <Select
              allowClear
              placeholder="请选择导出平台"
              value={sqlConfig?.platform}
              options={platformOptions.map((value) => ({
                value,
                label: value,
              }))}
              onChange={(platform) =>
                setSqlConfig((current) => ({ ...current, platform }))
              }
            />
          </label>
          <Typography.Text type="secondary">
            {sqlConfig?.platform
              ? `将导出 ${sqlRows.length} 条权限；平台权限会自动包含通用权限及必要的父节点。`
              : `未选择平台，将导出全部 ${sqlRows.length} 条权限。`}
          </Typography.Text>
        </div>
        {sqlContent && (
          <pre className="permission-workbench__sql-preview">{sqlContent}</pre>
        )}
      </Modal>
    </div>
  );
};
