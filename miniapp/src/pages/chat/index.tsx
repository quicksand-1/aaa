import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, ScrollView, Text, View } from '@tarojs/components'
import PageShell from '@/components/PageShell'
import { XMessages, XSender, XWorkspace } from '@/components/x'
import type { WorkspaceEntry, WorkspaceNode } from '@/components/x'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import './index.scss'

function createWelcomeMessage(): any {
  return {
    key: 'welcome',
    role: 'assistant',
    status: 'success',
    content: '你好，我是业务助手。可以描述你要处理的工作事项。',
    created_at: new Date().toISOString(),
  }
}

function createAssistantReply(): any {
  const now = new Date()
  return {
    key: `assistant-${now.getTime()}`,
    role: 'assistant',
    status: 'success',
    created_at: now.toISOString(),
    finished_at: new Date(now.getTime() + 500).toISOString(),
    content: '已收到。请继续补充需要查询的对象、时间范围或业务模块，我会基于当前会话继续处理。',
  }
}

const WORKSPACE_ENTRIES: WorkspaceEntry[] = [
  {
    name: '业务资料',
    is_dir: true,
    updated_at: '2026-11-23T09:30:00',
    children: [
      { name: '客户信息.xlsx', size_bytes: 42800, updated_at: '2026-11-23T09:30:00' },
      { name: '业务规则.md', size_bytes: 18200, updated_at: '2026-11-23T09:20:00' },
    ],
  },
  { name: '今日工作记录.md', size_bytes: 9240, updated_at: '2026-11-23T10:02:00' },
]

const DEFAULT_SESSION = { id: 'session-1', name: '业务助手' }

export default function ChatPage() {
  const { user, loading } = useCurrentUser()
  const [sessions, setSessions] = useState([DEFAULT_SESSION])
  const [activeSessionId, setActiveSessionId] = useState(DEFAULT_SESSION.id)
  const [messagesBySession, setMessagesBySession] = useState<Record<string, any[]>>(
    () => ({ [DEFAULT_SESSION.id]: [createWelcomeMessage()] }),
  )
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sessionKeyword, setSessionKeyword] = useState('')
  const [atBottom, setAtBottom] = useState(true)
  const [scrollRequest, setScrollRequest] = useState(0)
  const replyTimer = useRef<ReturnType<typeof setTimeout>>()
  const messages = messagesBySession[activeSessionId] || []
  const visibleSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(sessionKeyword.trim().toLowerCase()),
  )

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current)
    }
  }, [])

  const send = () => {
    if (typing) {
      if (replyTimer.current) clearTimeout(replyTimer.current)
      setTyping(false)
      Taro.showToast({ title: '已停止生成', icon: 'none' })
      return
    }

    const content = input.trim()
    if (!content) {
      Taro.showToast({ title: '请输入消息', icon: 'none' })
      return
    }

    const sessionId = activeSessionId
    const userMessage = {
      key: `user-${Date.now()}`,
      role: 'user',
      content,
      status: 'success',
      created_at: new Date().toISOString(),
    }
    setMessagesBySession((previous) => ({
      ...previous,
      [sessionId]: [...(previous[sessionId] || []), userMessage],
    }))
    setSessions((previous) =>
      previous.map((session) =>
        session.id === sessionId && session.name === '新会话'
          ? { ...session, name: content.slice(0, 14) }
          : session,
      ),
    )
    setInput('')
    setAtBottom(true)
    setScrollRequest((value) => value + 1)
    setTyping(true)
    replyTimer.current = setTimeout(() => {
      setMessagesBySession((previous) => ({
        ...previous,
        [sessionId]: [...(previous[sessionId] || []), createAssistantReply()],
      }))
      setAtBottom(true)
      setScrollRequest((value) => value + 1)
      setTyping(false)
    }, 900)
  }

  const handleWorkspaceFile = async (node: WorkspaceNode) => {
    Taro.showToast({ title: `已选择 ${node.name}`, icon: 'none' })
  }

  const startNewConversation = () => {
    if (typing) return
    const session = { id: `session-${Date.now()}`, name: '新会话' }
    setSessions((previous) => [...previous, session])
    setMessagesBySession((previous) => ({
      ...previous,
      [session.id]: [createWelcomeMessage()],
    }))
    setActiveSessionId(session.id)
    setInput('')
    setDrawerOpen(false)
    setSessionKeyword('')
    setAtBottom(true)
    setScrollRequest((value) => value + 1)
  }

  const selectSession = (sessionId: string) => {
    if (typing || sessionId === activeSessionId) {
      setDrawerOpen(false)
      return
    }
    setActiveSessionId(sessionId)
    setInput('')
    setDrawerOpen(false)
    setSessionKeyword('')
    setAtBottom(true)
    setScrollRequest((value) => value + 1)
  }

  const clearConversation = () => {
    if (typing) return
    Taro.showModal({
      title: '清空当前对话？',
      content: '清空后将移除当前页面中的消息记录。',
      confirmText: '清空',
      confirmColor: '#dc2626',
      success: ({ confirm }) => {
        if (!confirm) return
        setMessagesBySession((previous) => ({ ...previous, [activeSessionId]: [] }))
        setAtBottom(true)
        setScrollRequest((value) => value + 1)
      },
    })
  }

  return (
    <PageShell
      title='对话'
      activeTab='chat'
      user={user}
      loading={loading}
      onBrandClick={() => setDrawerOpen(true)}
    >
      <View className='chat-page'>
        <ScrollView
          className='chat-page__scroll'
          scrollIntoView={`chat-bottom-${scrollRequest}`}
          scrollY
          onScroll={(event) => {
            if (event.detail?.deltaY < 0) setAtBottom(false)
          }}
          onScrollToLower={() => setAtBottom(true)}
        >
          <View className='chat-page__scroll-content'>
            <XMessages items={messages} typing={typing} density='compact' />
            <View id={`chat-bottom-${scrollRequest}`} className='chat-page__bottom-sentinel' />
          </View>
        </ScrollView>

        {!atBottom ? (
          <View
            className='chat-page__jump'
            onClick={() => {
              setAtBottom(true)
              setScrollRequest((value) => value + 1)
            }}
          >
            <Text>↓</Text>
            <Text>回到底部</Text>
          </View>
        ) : null}

        <View className='chat-page__composer'>
          <ScrollView className='chat-page__actions' scrollX showScrollbar={false}>
            <View className='chat-page__actions-inner'>
              <View className='chat-page__action' onClick={() => setWorkspaceOpen(true)}>
                <Text>工作空间</Text>
              </View>
              <View className='chat-page__action' onClick={startNewConversation}>
                <Text>新建会话</Text>
              </View>
              <View className='chat-page__action' onClick={clearConversation}>
                <Text>清空对话</Text>
              </View>
            </View>
          </ScrollView>
          <XSender
            value={input}
            placeholder='输入消息'
            maxlength={-1}
            confirmType='send'
            onInput={setInput}
            onConfirm={send}
          >
            <Button className={`chat-page__send ${typing ? 'is-stop' : ''}`} onClick={send}>
              {typing ? '停止' : '发送'}
            </Button>
          </XSender>
        </View>
      </View>

      {drawerOpen ? (
        <View className='chat-drawer__mask' onClick={() => setDrawerOpen(false)} />
      ) : null}
      <View className={`chat-drawer ${drawerOpen ? 'is-open' : ''}`}>
        <View className='chat-drawer__head'>
          <Text className='chat-drawer__title'>会话列表</Text>
          <View className='chat-drawer__close' onClick={() => setDrawerOpen(false)}>
            <Text>×</Text>
          </View>
        </View>
        <View className='chat-drawer__new-row'>
          <View className='chat-drawer__search'>
            <View className='chat-drawer__search-icon' />
            <Input
              className='chat-drawer__search-input'
              placeholder='搜索会话'
              placeholderClass='chat-drawer__search-placeholder'
              value={sessionKeyword}
              onInput={(event) => setSessionKeyword(event.detail.value)}
            />
          </View>
          <View className='chat-drawer__new' onClick={startNewConversation}>
            <Text className='chat-drawer__new-icon'>＋</Text>
            <Text>新建</Text>
          </View>
        </View>
        <ScrollView className='chat-drawer__list' scrollY>
          {visibleSessions.map((session) => (
            <View
              key={session.id}
              className={`chat-drawer__item ${session.id === activeSessionId ? 'is-active' : ''}`}
              onClick={() => selectSession(session.id)}
            >
              <Text className='chat-drawer__item-name'>{session.name}</Text>
              {session.id === activeSessionId ? (
                <Text className='chat-drawer__item-mark'>当前</Text>
              ) : null}
            </View>
          ))}
          {!visibleSessions.length ? (
            <View className='chat-drawer__empty'>
              <Text>没有找到匹配的会话</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <XWorkspace
        open={workspaceOpen}
        entries={WORKSPACE_ENTRIES}
        onClose={() => setWorkspaceOpen(false)}
        onFilePress={handleWorkspaceFile}
      />
    </PageShell>
  )
}
