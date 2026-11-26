import { useEffect, useRef, useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { Xmessages, Xsender } from 'fintech/x';
import ConversationDrawer from './ConversationDrawer';

const WELCOME_MESSAGE = {
  key: 'assistant-welcome',
  role: 'assistant',
  status: 'success',
  content: '你好，我是业务助手。可以描述你要处理的工作事项。',
};

let conversationSequence = 0;

function createConversation() {
  conversationSequence += 1;
  const now = Date.now();

  return {
    id: `conversation-${now}-${conversationSequence}`,
    title: '新会话',
    updatedAt: now,
    messages: [WELCOME_MESSAGE],
  };
}

function buildAssistantReply() {
  return {
    key: `assistant-${Date.now()}`,
    role: 'assistant',
    status: 'success',
    content:
      '已收到。请继续补充需要查询的对象、时间范围或业务模块，我会基于当前会话继续处理。',
  };
}

function buildSessionTitle(content) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 18 ? `${normalized.slice(0, 18)}…` : normalized;
}

export default function MobileChatPage() {
  const drawerRef = useRef(null);
  const replyTimerRef = useRef(null);
  const [sessions, setSessions] = useState(() => [createConversation()]);
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0].id);
  const [runningSessionId, setRunningSessionId] = useState(null);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) || sessions[0];
  const running = runningSessionId === activeSession.id;

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  const handleSubmit = (value) => {
    const question = String(value?.text || '').trim();
    if (!question || runningSessionId) return;

    const targetSessionId = activeSession.id;
    const now = Date.now();

    setSessions((previous) =>
      previous.map((session) => {
        if (session.id !== targetSessionId) return session;

        const hasUserMessage = session.messages.some(
          (item) => item.role === 'user'
        );

        return {
          ...session,
          title: hasUserMessage ? session.title : buildSessionTitle(question),
          updatedAt: now,
          messages: [
            ...session.messages,
            {
              key: `user-${now}`,
              role: 'user',
              status: 'success',
              content: question,
            },
          ],
        };
      })
    );
    setRunningSessionId(targetSessionId);

    replyTimerRef.current = setTimeout(() => {
      replyTimerRef.current = null;
      setSessions((previous) =>
        previous.map((session) =>
          session.id === targetSessionId
            ? {
                ...session,
                updatedAt: Date.now(),
                messages: [...session.messages, buildAssistantReply()],
              }
            : session
        )
      );
      setRunningSessionId(null);
    }, 900);
  };

  const stopGenerating = () => {
    if (!runningSessionId) return;
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = null;
    setRunningSessionId(null);
    message.info('已停止生成');
  };

  const createSession = () => {
    const session = createConversation();
    setSessions((previous) => [session, ...previous]);
    setActiveSessionId(session.id);
    drawerRef.current?.open(false);
  };

  const selectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    drawerRef.current?.open(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <header
        className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex h-14 items-center gap-2 px-2">
          <button
            aria-label="打开会话列表"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-700 active:bg-slate-100"
            type="button"
            onClick={() => drawerRef.current?.open(true)}
          >
            <MenuOutlined />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-slate-900">
              {activeSession.title}
            </div>
          </div>

          <span aria-hidden="true" className="h-11 w-11 shrink-0" />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden px-3 pt-3">
        <Xmessages
          key={activeSession.id}
          items={activeSession.messages}
          role={{
            user: { placement: 'end' },
            assistant: (item) => ({ loading: item.status === 'loading' }),
          }}
          listProps={{
            style: {
              height: '100%',
              overflowY: 'auto',
              paddingBottom: 16,
            },
          }}
        />
      </main>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <Xsender
          key={activeSession.id}
          disabled={!!runningSessionId && !running}
          loading={running}
          onCancel={stopGenerating}
          onSubmit={handleSubmit}
          placeholder="输入消息"
        />
      </footer>

      <ConversationDrawer
        actionRef={drawerRef}
        activeSessionId={activeSession.id}
        runningSessionId={runningSessionId}
        sessions={sessions}
        onCreateSession={createSession}
        onSelectSession={selectSession}
      />
    </div>
  );
}
