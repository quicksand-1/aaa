import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Image, RichText, Text, View } from '@tarojs/components'
import XThinking from '@/components/x-thinking'
import * as model from './model'
import './index.scss'

export interface XMessagesProps {
  items: any[]
  loading?: boolean
  loadingText?: string
  typing?: boolean
  density?: 'default' | 'compact'
  backgroundTasks?: any[]
  backgroundTaskResults?: Record<string, unknown>
  onThinkingToggle?: (payload: {
    messageId: string
    groupKey: string
    expanded: boolean
  }) => void
  onToolGroupToggle?: (payload: {
    messageId: string
    blockKey: string
  }) => void
}

const TOOL_STATE_TEXT: Record<string, string> = {
  running: '◌',
  asking: '?',
  error: '×',
  interrupted: '■',
  done: '✓',
}

function statusGlyph(state?: string): string {
  if (state === 'loading') return '◌'
  if (state === 'error') return '×'
  return '✓'
}

export default function XMessages({
  items,
  loading = false,
  loadingText = '加载中…',
  typing = false,
  density = 'default',
  backgroundTasks = [],
  backgroundTaskResults = {},
  onThinkingToggle,
  onToolGroupToggle,
}: XMessagesProps) {
  const [now, setNow] = useState(Date.now())
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({})
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({})

  const showLoadingState = loading && items.length === 0

  const bubbleItems = useMemo(() => {
    if (showLoadingState) return []

    const result = model.buildBubbleItems({
      items,
      typing,
      backgroundTasks,
      backgroundTaskResults,
      now,
    })

    result.forEach((item) => {
      ;(item.renderGroups || []).forEach((group: any) => {
        if (group.type === 'thinking' && Object.prototype.hasOwnProperty.call(expandedThinking, group.key)) {
          group.expanded = expandedThinking[group.key]
        }
        if (group.type === 'tools' && Object.prototype.hasOwnProperty.call(expandedTools, group.blockKey)) {
          group.expanded = expandedTools[group.blockKey]
        }
      })
    })

    return result
  }, [
    backgroundTaskResults,
    backgroundTasks,
    expandedThinking,
    expandedTools,
    items,
    now,
    showLoadingState,
    typing,
  ])

  const hasRunningFooter = bubbleItems.some(
    (item) => item.footer && item.footer.state === 'loading',
  )

  useEffect(() => {
    if (!hasRunningFooter) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [hasRunningFooter])

  useEffect(() => {
    if (!items.length) {
      setExpandedThinking({})
      setExpandedTools({})
    }
  }, [items.length])

  const toggleThinking = (item: any, group: any, expanded: boolean) => {
    setExpandedThinking((previous) => ({ ...previous, [group.key]: expanded }))
    onThinkingToggle?.({
      messageId: item.key,
      groupKey: group.key,
      expanded,
    })
  }

  const toggleToolGroup = (item: any, group: any) => {
    const nextExpanded = !group.expanded
    setExpandedTools((previous) => ({
      ...previous,
      [group.blockKey]: nextExpanded,
    }))
    onToolGroupToggle?.({
      messageId: item.key,
      blockKey: group.blockKey,
    })
  }

  const showToolDetail = (tool: any) => {
    if (!tool.hasBody || !tool.bodyText || tool.backgroundLabel) return
    Taro.showModal({
      title: tool.label || '工具详情',
      content: tool.bodyText,
      showCancel: false,
      confirmText: '知道了',
    })
  }

  const showFooterDetail = (detailText: string) => {
    if (!detailText) return
    Taro.showModal({
      title: '响应详情',
      content: detailText,
      showCancel: false,
      confirmText: '知道了',
    })
  }

  const copyMessage = (item: any) => {
    if (item.status === 'loading') return
    const text = model.getCopyableText(items[item.sourceIndex])
    if (!String(text || '').trim()) return
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
      fail: () =>
        Taro.showToast({
          title: '复制失败，请选择正文手动复制',
          icon: 'none',
        }),
    })
  }

  if (showLoadingState) {
    return (
      <View className={`x-messages x-messages--${density}`}>
        <View className='x-messages__state'>
          <View className='x-messages__dot' />
          <Text>{loadingText}</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`x-messages x-messages--${density}`}>
      {bubbleItems.map((item) => (
        <View
          key={item.key}
          className={`message-row ${item.isEnd ? 'message-row--end' : 'message-row--start'}`}
        >
          {item.meta.label || item.meta.timeText ? (
            <View className={`message-meta ${item.isEnd ? 'message-meta--end' : ''}`}>
              {item.meta.label ? <Text>{item.meta.label}</Text> : null}
              {item.meta.timeText ? <Text>{item.meta.timeText}</Text> : null}
            </View>
          ) : null}

          {item.type === 'date_separator' ? (
            <Text className='message-date'>{item.content}</Text>
          ) : (
            <View
              className={`message-bubble ${item.isEnd ? 'message-bubble--end' : 'message-bubble--start'} ${
                item.type === 'status' ? 'message-bubble--status' : ''
              }`}
            >
              {item.type === 'status' ? (
                <View className='message-status'>
                  <Text className={`message-status__icon ${item.status === 'loading' ? 'is-running' : ''}`}>
                    {item.status === 'loading' ? '◌' : '·'}
                  </Text>
                  {item.content ? <Text>{item.content}</Text> : null}
                </View>
              ) : (
                <>
                  {item.extraInfo.statusText ? (
                    <View className={`message-status ${item.extraInfo.statusMuted ? 'is-muted' : ''}`}>
                      <View className='message-status__dot' />
                      <Text>{item.extraInfo.statusText}</Text>
                    </View>
                  ) : null}

                  {item.type === 'text' ? (
                    <Text className='message-plain-text'>{item.content}</Text>
                  ) : null}

                  {item.type === 'blocks'
                    ? item.renderGroups.map((group: any) => {
                        if (group.type === 'thinking') {
                          return (
                            <XThinking
                              key={group.key}
                              content={group.content}
                              expanded={group.expanded}
                              onToggle={(expanded) => toggleThinking(item, group, expanded)}
                            />
                          )
                        }

                        if (group.type === 'tools') {
                          return (
                            <View key={group.key} className='message-tool-group'>
                              <View
                                className='message-tool-group__head'
                                onClick={() => toggleToolGroup(item, group)}
                              >
                                <Text className='message-tool-group__title'>{group.title}</Text>
                                {group.running ? (
                                  <Text className='message-tool-group__spinner'>◌</Text>
                                ) : group.hasDiff ? (
                                  <View className='message-tool-group__stats'>
                                    <Text className='is-add'>+{group.insertions}</Text>
                                    <Text className='is-del'>-{group.deletions}</Text>
                                  </View>
                                ) : null}
                                <Text
                                  className={`message-tool-group__toggle ${
                                    group.expanded ? 'is-expanded' : ''
                                  }`}
                                >
                                  ›
                                </Text>
                              </View>

                              {group.expanded ? (
                                <View className='message-tool-group__body'>
                                  {group.calls.map((tool: any) => (
                                    <View
                                      key={tool.key}
                                      className='message-tool-row'
                                      onClick={() => showToolDetail(tool)}
                                    >
                                      <View className='message-tool-row__main'>
                                        <View className='message-tool-row__copy'>
                                          <Text className='message-tool__label'>{tool.label}</Text>
                                          {tool.argument ? (
                                            <Text className='message-tool__argument'>{tool.argument}</Text>
                                          ) : null}
                                        </View>
                                        <View className='message-tool-row__meta'>
                                          {tool.metaText ? (
                                            <Text className='message-tool__meta'>{tool.metaText}</Text>
                                          ) : null}
                                          {tool.backgroundLabel ? (
                                            <Text className='message-tool__background'>{tool.backgroundLabel}</Text>
                                          ) : tool.durationText ? (
                                            <Text className='message-tool__duration'>{tool.durationText}</Text>
                                          ) : null}
                                          <Text className={`message-tool__state is-${tool.stateKey}`}>
                                            {TOOL_STATE_TEXT[tool.stateKey] || '✓'}
                                          </Text>
                                          {tool.hasBody && !tool.backgroundLabel ? (
                                            <Text className='message-tool__chevron'>›</Text>
                                          ) : null}
                                        </View>
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              ) : null}
                            </View>
                          )
                        }

                        const block = group.block
                        if (block?.type === 'rich') {
                          return (
                            <RichText
                              key={group.key}
                              className='message-rich-text'
                              nodes={block.nodes}
                            />
                          )
                        }
                        if (block?.type === 'text') {
                          return (
                            <Text key={group.key} className='message-plain-text'>
                              {block.text}
                            </Text>
                          )
                        }
                        return block?.src ? (
                          <View key={group.key} className='message-image-block'>
                            <Image
                              className='message-image'
                              mode='widthFix'
                              src={block.src}
                              showMenuByLongpress
                            />
                            {block.alt ? <Text className='message-image-caption'>{block.alt}</Text> : null}
                          </View>
                        ) : null
                      })
                    : null}

                  {item.type === 'markdown' ? (
                    <RichText className='message-rich-text' nodes={item.nodes} />
                  ) : null}

                  {item.type === 'attachments' ? (
                    <View className='message-attachments'>
                      {item.content ? <Text className='message-plain-text'>{item.content}</Text> : null}
                      {item.attachments.map((file: any, index: number) => (
                        <View key={file.id || index} className='message-attachment'>
                          <Text>{file.name || '附件'}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {item.status === 'error' ? (
                    <View className='message-error'>
                      <Text>{item.extraInfo.errorMessage || '本轮生成失败'}</Text>
                    </View>
                  ) : null}

                  {item.typing && !item.footer ? (
                    <View className='message-typing'>
                      <Text>正在生成…</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          )}

          {item.footer ? (
            <View className={`message-footer ${item.isEnd ? 'message-footer--end' : ''}`}>
              {item.footer.showStatus ? (
                <Text className={`message-footer__state is-${item.footer.state}`}>
                  {statusGlyph(item.footer.state)}
                </Text>
              ) : null}
              <Text
                className='message-footer__time'
                onClick={() => showFooterDetail(item.footer.detailText)}
              >
                {item.footer.timeText}
              </Text>
              {item.footer.hasUsage ? (
                <View className='message-footer__usage'>
                  <Text>↑ {item.footer.inText}</Text>
                  <Text>↓ {item.footer.outText}</Text>
                </View>
              ) : null}
              {item.footer.canCopy ? (
                <Text className='message-footer__copy' onClick={() => copyMessage(item)}>
                  复制
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  )
}
