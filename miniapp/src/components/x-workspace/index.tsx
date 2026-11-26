import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input, ScrollView, Text, View } from '@tarojs/components'
import {
  attachChildren,
  buildTree,
  filterTree,
  formatFileSize,
  formatUpdatedAt,
  updateNodeLoading,
  type WorkspaceEntry,
  type WorkspaceNode,
} from './model'
import './index.scss'

export interface XWorkspaceProps {
  open: boolean
  title?: string
  entries?: WorkspaceEntry[]
  loadEntries?: (path: string) => Promise<WorkspaceEntry[]>
  emptyText?: string
  onFilePress?: (node: WorkspaceNode) => void | Promise<void>
  onClose: () => void
}

const EMPTY_ENTRIES: WorkspaceEntry[] = []

interface VisibleNode {
  path: string
  name: string
  isDir: boolean
  expanded: boolean
  indent: number
  meta: string
  loading: boolean
  node: WorkspaceNode
}

export default function XWorkspace({
  open,
  title = '工作空间',
  entries = EMPTY_ENTRIES,
  loadEntries,
  emptyText = '工作空间暂无文件',
  onFilePress,
  onClose,
}: XWorkspaceProps) {
  const [keyword, setKeyword] = useState('')
  const [tree, setTree] = useState<WorkspaceNode[]>([])
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestVersion = useRef(0)
  const entriesRef = useRef(entries)
  entriesRef.current = entries
  const entriesKey = useMemo(() => JSON.stringify(entries), [entries])

  const loadRoot = useCallback(async () => {
    const version = ++requestVersion.current
    setTree([])
    setExpandedPaths({})
    setKeyword('')
    setError('')

    if (!loadEntries) {
      setTree(buildTree(entriesRef.current))
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const nextEntries = await loadEntries('')
      if (requestVersion.current === version) setTree(buildTree(nextEntries))
    } catch {
      if (requestVersion.current === version) {
        setError('工作空间内容加载失败，请刷新后重试。')
      }
    } finally {
      if (requestVersion.current === version) setLoading(false)
    }
  }, [loadEntries])

  useEffect(() => {
    if (!open) {
      requestVersion.current += 1
      return
    }
    void loadRoot()
  }, [entriesKey, loadRoot, open])

  const filteredTree = useMemo(() => filterTree(tree, keyword), [keyword, tree])
  const searching = Boolean(keyword.trim())

  const visibleNodes = useMemo(() => {
    const rows: VisibleNode[] = []

    const walk = (nodes: WorkspaceNode[], depth: number) => {
      nodes.forEach((node) => {
        const expanded = node.isDir && (searching || expandedPaths[node.path] === true)
        const meta: string[] = []
        if (!node.isDir) {
          const sizeText = formatFileSize(node.sizeBytes)
          if (sizeText) meta.push(sizeText)
        }
        const updatedText = formatUpdatedAt(node.updatedAt)
        if (updatedText) meta.push(updatedText)
        if (node.childrenLoading) meta.splice(0, meta.length, '加载中…')

        rows.push({
          path: node.path,
          name: node.name,
          isDir: node.isDir,
          expanded,
          indent: depth * 28,
          meta: meta.join(' · '),
          loading: node.childrenLoading,
          node,
        })

        if (expanded && node.childrenLoaded) walk(node.children, depth + 1)
      })
    }

    walk(filteredTree, 0)
    return rows
  }, [expandedPaths, filteredTree, searching])

  const hasExpanded = visibleNodes.some((node) => node.isDir && node.expanded)

  const toggleNode = async (node: WorkspaceNode) => {
    if (!node.isDir || node.childrenLoading) return

    if (expandedPaths[node.path]) {
      setExpandedPaths((previous) => ({ ...previous, [node.path]: false }))
      return
    }

    setExpandedPaths((previous) => ({ ...previous, [node.path]: true }))
    if (node.childrenLoaded || !loadEntries) return

    setTree((previous) => updateNodeLoading(previous, node.path, true))
    setError('')
    try {
      const nextEntries = await loadEntries(node.path)
      setTree((previous) => attachChildren(previous, node.path, buildTree(nextEntries, node.path)))
    } catch {
      setError(`目录「${node.name}」加载失败，请刷新后重试。`)
      setTree((previous) => updateNodeLoading(previous, node.path, false))
    }
  }

  const collapseAll = () => {
    setExpandedPaths({})
  }

  const pressFile = async (node: WorkspaceNode) => {
    if (node.isDir) {
      await toggleNode(node)
      return
    }

    if (!onFilePress) {
      Taro.showToast({ title: '未配置文件操作', icon: 'none' })
      return
    }

    try {
      await onFilePress(node)
    } catch (fileError) {
      Taro.showToast({
        title: fileError instanceof Error ? fileError.message : '文件操作失败',
        icon: 'none',
      })
    }
  }

  return (
    <>
      <View
        className={`x-workspace__mask ${open ? 'is-open' : ''}`}
        onClick={onClose}
      />
      <View className={`x-workspace ${open ? 'is-open' : ''}`}>
        <View className='x-workspace__head'>
          <View>
            <Text className='x-workspace__title'>{title}</Text>
            <Text className='x-workspace__subtitle'>会话文件与生成内容</Text>
          </View>
          <View className='x-workspace__close' onClick={onClose}>
            <Text>关闭</Text>
          </View>
        </View>

        <View className='x-workspace__search'>
          <Text className='x-workspace__search-icon'>⌕</Text>
          <Input
            className='x-workspace__search-input'
            confirmType='search'
            placeholder='搜索文件名或路径'
            placeholderClass='x-workspace__search-placeholder'
            value={keyword}
            onInput={(event) => setKeyword(event.detail.value)}
          />
          {keyword ? (
            <View className='x-workspace__search-clear' onClick={() => setKeyword('')}>
              <Text>×</Text>
            </View>
          ) : null}
        </View>

        <View className='x-workspace__toolbar'>
          <Text className='x-workspace__toolbar-label'>文件</Text>
          <View className='x-workspace__toolbar-actions'>
            <View
              className={`x-workspace__tool ${loading ? 'is-disabled' : ''}`}
              onClick={() => {
                if (!loading) void loadRoot()
              }}
            >
              <Text>{loading ? '加载中…' : '刷新'}</Text>
            </View>
            <View
              className={`x-workspace__tool ${hasExpanded ? '' : 'is-disabled'}`}
              onClick={() => {
                if (hasExpanded) collapseAll()
              }}
            >
              <Text>收起全部</Text>
            </View>
          </View>
        </View>

        {error && visibleNodes.length ? (
          <View className='x-workspace__error-banner'>
            <Text>{error}</Text>
          </View>
        ) : null}

        <ScrollView className='x-workspace__scroll' scrollY>
          {loading && !visibleNodes.length ? (
            <View className='x-workspace__state'>
              <Text className='x-workspace__state-icon is-running'>◌</Text>
              <Text>加载中…</Text>
            </View>
          ) : error && !visibleNodes.length ? (
            <View className='x-workspace__state'>
              <Text className='x-workspace__state-title'>无法加载工作空间</Text>
              <Text className='x-workspace__state-hint'>{error}</Text>
              <View className='x-workspace__retry' onClick={() => void loadRoot()}>
                <Text>重试</Text>
              </View>
            </View>
          ) : !visibleNodes.length ? (
            <View className='x-workspace__state'>
              <Text className='x-workspace__state-title'>
                {searching ? '没有匹配的文件' : emptyText}
              </Text>

            </View>
          ) : (
            <View className='x-workspace__tree'>
              {visibleNodes.map((item) => (
                <View
                  key={item.path}
                  className={`x-workspace__node ${item.isDir ? 'is-dir' : 'is-file'}`}
                  style={{ paddingLeft: `${item.indent}px` }}
                  onClick={() => void pressFile(item.node)}
                >
                  <Text
                    className={`x-workspace__chevron ${
                      item.isDir && item.expanded ? 'is-expanded' : ''
                    }`}
                  >
                    {item.isDir ? '›' : '·'}
                  </Text>
                  <Text className='x-workspace__type'>{item.isDir ? 'DIR' : 'FILE'}</Text>
                  <View className='x-workspace__node-copy'>
                    <Text className='x-workspace__node-name'>{item.name}</Text>
                    {item.meta ? <Text className='x-workspace__node-meta'>{item.meta}</Text> : null}
                  </View>
                  {!item.isDir && onFilePress ? (
                    <Text className='x-workspace__file-action'>操作</Text>
                  ) : null}
                </View>
              ))}

              {loading && visibleNodes.length ? (
                <View className='x-workspace__list-loading'>
                  <Text>加载中…</Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        <View className='x-workspace__foot'>
          <Text>文件操作将按当前会话权限执行</Text>
        </View>
      </View>
    </>
  )
}
