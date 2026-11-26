let rowSeed = 0;

const nextRowId = () => `permission-row-${Date.now()}-${rowSeed++}`;

const asText = (value, fallback = '') =>
  value === undefined || value === null ? fallback : String(value);

export const normalizePermissionTree = (data) => {
  if (!Array.isArray(data)) throw new Error('JSON 顶层必须是数组');

  const normalize = (item, depth) => {
    if (!item || Array.isArray(item) || typeof item !== 'object') {
      throw new Error('权限节点必须是对象');
    }
    const { children, key, plf, title, type, ...rest } = item;
    delete rest.disabled;
    return {
      ...rest,
      id: nextRowId(),
      plf: asText(plf),
      permissionKey: asText(key),
      title: asText(title),
      type: asText(type, String(depth)),
      children: Array.isArray(children)
        ? children.map((child) => normalize(child, depth + 1))
        : [],
    };
  };

  return data.map((item) => normalize(item, 1));
};

export const serializePermissionTree = (data) => {
  const serialize = (item) => {
    const {
      id,
      permissionKey,
      children = [],
      plf,
      title,
      type,
      ...rest
    } = item;
    const output = {
      plf: asText(plf),
      key: asText(permissionKey),
      title: asText(title),
      type: asText(type),
      ...rest,
    };
    if (children.length) output.children = children.map(serialize);
    return output;
  };
  return data.map(serialize);
};

export const createPermissionNode = (depth = 1) => ({
  id: nextRowId(),
  plf: '',
  permissionKey: '',
  title: '未命名权限',
  type: String(depth),
  children: [],
});

const mapTree = (nodes, id, transform) =>
  nodes.map((node) => {
    if (node.id === id) return transform(node);
    if (!node.children?.length) return node;
    return { ...node, children: mapTree(node.children, id, transform) };
  });

export const updatePermissionNode = (nodes, id, patch) =>
  mapTree(nodes, id, (node) => ({ ...node, ...patch }));

export const removePermissionNode = (nodes, id) =>
  nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: removePermissionNode(node.children || [], id),
    }));

export const insertPermissionNode = (nodes, targetId, position) => {
  if (!targetId) return [...nodes, createPermissionNode(1)];

  const visit = (items, depth) => {
    const result = [];
    for (const item of items) {
      if (item.id === targetId && position === 'before') {
        result.push(createPermissionNode(depth));
      }
      if (item.id === targetId && position === 'child') {
        result.push({
          ...item,
          children: [...(item.children || []), createPermissionNode(depth + 1)],
        });
      } else {
        result.push({
          ...item,
          children: visit(item.children || [], depth + 1),
        });
      }
      if (item.id === targetId && position === 'after') {
        result.push(createPermissionNode(depth));
      }
    }
    return result;
  };
  return visit(nodes, 1);
};

const syncTypes = (nodes, depth = 1) =>
  nodes.map((node) => ({
    ...node,
    type: String(depth),
    children: syncTypes(node.children || [], depth + 1),
  }));

export const movePermissionNode = (
  source,
  dragId,
  dropId,
  dropPosition,
  dropToGap,
) => {
  const data = structuredClone(source);
  let dragged;
  const remove = (items) => {
    for (let index = 0; index < items.length; index += 1) {
      if (items[index].id === dragId) {
        [dragged] = items.splice(index, 1);
        return true;
      }
      if (remove(items[index].children || [])) return true;
    }
    return false;
  };
  const insert = (items) => {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (item.id === dropId) {
        if (dropToGap) {
          items.splice(dropPosition < 0 ? index : index + 1, 0, dragged);
        } else {
          item.children = [dragged, ...(item.children || [])];
        }
        return true;
      }
      if (insert(item.children || [])) return true;
    }
    return false;
  };

  remove(data);
  if (!dragged || !insert(data)) return source;
  return syncTypes(data);
};

export const flattenPermissionTree = (nodes) => {
  const rows = [];
  const walk = (items, ancestors = []) => {
    items.forEach((item, index) => {
      rows.push({
        ...item,
        parentKey: ancestors.at(-1)?.permissionKey || '0',
        parentKeys: ancestors.map((ancestor) => ancestor.permissionKey),
        sortNo: index + 1,
        depth: ancestors.length + 1,
      });
      walk(item.children || [], [...ancestors, item]);
    });
  };
  walk(nodes);
  return rows;
};

export const validatePermissionTree = (nodes) => {
  const rows = flattenPermissionTree(nodes);
  return rows.flatMap((row) => {
    const issues = [];
    if (!row.permissionKey.trim()) issues.push({ id: row.id, field: 'key' });
    if (!row.title.trim()) issues.push({ id: row.id, field: 'title' });
    return issues;
  });
};

export const filterPermissionTreeByPlatform = (nodes, platform) => {
  if (platform === undefined || platform === null) return nodes;
  const visit = (items) =>
    items.flatMap((item) => {
      const children = visit(item.children || []);
      const itemPlatforms = item.plf
        .split('|')
        .map((value) => value.trim())
        .filter(Boolean);
      const matched =
        itemPlatforms.length === 0 || itemPlatforms.includes(platform);
      return matched || children.length ? [{ ...item, children }] : [];
    });
  return visit(nodes);
};

const sqlText = (value) => `'${asText(value).replaceAll("'", "''")}'`;
export const createPermissionSql = (nodes, dialect = 'oracle', platform) => {
  const mysql = dialect === 'mysql';
  const now = mysql ? 'NOW()' : 'SYSDATE';
  const rows = flattenPermissionTree(
    filterPermissionTreeByPlatform(nodes, platform),
  );
  const heading = [
    '-- 权限表工作台导出',
    `-- 数据库：${mysql ? 'MySQL' : 'Oracle'}`,
    `-- 共 ${rows.length} 条权限记录`,
    '',
  ].join('\n');

  const statements = rows.map((row) => {
    const columns = [
      ...(mysql ? [] : ['ID']),
      'URL',
      'CODE',
      'ICON',
      'NAME',
      'PCODE',
      'METHOD',
      'PCODES',
      'DESCRIPTION',
      'NUM',
      'ISMENU',
      'ISOPEN',
      'LEVELS',
      'STATUS',
      'VERSION',
      'GMT_CREATE',
      'GMT_MODIFIED',
    ];
    const values = [
      ...(mysql ? [] : ['SEQ_GENERAL_SYS_MENU_ID.nextval']),
      "'#'",
      sqlText(row.permissionKey),
      'NULL',
      sqlText(row.title),
      sqlText(row.parentKey),
      'NULL',
      sqlText(`[0],${row.parentKeys.map((key) => `[${key}],`).join('')}`),
      "''",
      String(row.sortNo),
      '1',
      '0',
      /^\d+$/.test(row.type) ? row.type : String(row.depth),
      '1',
      '0',
      now,
      now,
    ];
    return `INSERT INTO GENERAL_SYS_MENU (${columns.join(
      ', ',
    )}) VALUES (${values.join(', ')});`;
  });
  return `${heading}${statements.join('\n')}\n`;
};

export const filterPermissionTree = (nodes, keyword) => {
  const query = keyword.trim().toLocaleLowerCase();
  if (!query) return nodes;
  const visit = (items) =>
    items.flatMap((item) => {
      const children = visit(item.children || []);
      const matched = [item.permissionKey, item.title, item.plf, item.type]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query);
      return matched || children.length ? [{ ...item, children }] : [];
    });
  return visit(nodes);
};
