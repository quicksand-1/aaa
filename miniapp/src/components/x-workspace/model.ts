export interface WorkspaceEntry {
  name: string
  is_dir?: boolean
  size_bytes?: number | null
  updated_at?: string | number | null
  children?: WorkspaceEntry[]
}

export interface WorkspaceNode {
  key: string
  path: string
  name: string
  isDir: boolean
  sizeBytes?: number | null
  updatedAt?: string | number | null
  childrenLoaded: boolean
  childrenLoading: boolean
  children: WorkspaceNode[]
}

function joinPath(parentPath: string, name: string): string {
  return [parentPath, name]
    .map((part) => String(part || '').replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
}

function sortEntries(entries: WorkspaceEntry[]): WorkspaceEntry[] {
  return entries.slice().sort((left, right) => {
    if (Boolean(left?.is_dir) !== Boolean(right?.is_dir)) {
      return left?.is_dir ? -1 : 1
    }
    return String(left?.name || '').localeCompare(String(right?.name || ''), 'zh-CN')
  })
}

export function buildTree(entries: WorkspaceEntry[] = [], parentPath = ''): WorkspaceNode[] {
  return sortEntries(entries)
    .map((entry) => {
      const name = String(entry?.name || '')
      const path = joinPath(parentPath, name)
      const childEntries = Array.isArray(entry?.children) ? entry.children : []
      return {
        key: path,
        path,
        name,
        isDir: Boolean(entry?.is_dir),
        sizeBytes: entry?.size_bytes,
        updatedAt: entry?.updated_at,
        childrenLoaded: childEntries.length > 0,
        childrenLoading: false,
        children: childEntries.length ? buildTree(childEntries, path) : [],
      }
    })
    .filter((node) => Boolean(node.name))
}

export function attachChildren(
  nodes: WorkspaceNode[],
  parentPath: string,
  children: WorkspaceNode[],
): WorkspaceNode[] {
  return nodes.map((node) => {
    if (node.path === parentPath) {
      return {
        ...node,
        children,
        childrenLoaded: true,
        childrenLoading: false,
      }
    }
    if (!node.childrenLoaded) return node
    return {
      ...node,
      children: attachChildren(node.children, parentPath, children),
    }
  })
}

export function updateNodeLoading(
  nodes: WorkspaceNode[],
  path: string,
  loading: boolean,
): WorkspaceNode[] {
  return nodes.map((node) => {
    if (node.path === path) return { ...node, childrenLoading: loading }
    if (!node.childrenLoaded) return node
    return {
      ...node,
      children: updateNodeLoading(node.children, path, loading),
    }
  })
}

export function filterTree(nodes: WorkspaceNode[], keyword: string): WorkspaceNode[] {
  const text = keyword.trim().toLowerCase()
  if (!text) return nodes

  const walk = (items: WorkspaceNode[]): WorkspaceNode[] => {
    const result: WorkspaceNode[] = []
    items.forEach((node) => {
      const haystack = `${node.name} ${node.path}`.toLowerCase()
      if (haystack.includes(text)) {
        result.push(node)
        return
      }
      const children = node.childrenLoaded ? walk(node.children) : []
      if (children.length) result.push({ ...node, children })
    })
    return result
  }

  return walk(nodes)
}

export function hasDirectory(nodes: WorkspaceNode[]): boolean {
  return nodes.some((node) => node.isDir && (node.childrenLoaded || node.children.length))
}

export function formatFileSize(sizeBytes?: number | null): string {
  const size = Number(sizeBytes)
  if (!Number.isFinite(size) || size < 0) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

export function formatUpdatedAt(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return ''
  const timestamp = Number(value)
  const date = Number.isFinite(timestamp)
    ? new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp)
    : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}
