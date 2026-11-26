import { Input } from 'antd';
import {
  MessageOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { DrawerBox } from 'fintech';
import { useState } from 'react';

export default function ConversationDrawer({
  actionRef,
  sessions,
  activeSessionId,
  runningSessionId,
  onCreateSession,
  onSelectSession,
}) {
  const [keyword, setKeyword] = useState('');
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredSessions = normalizedKeyword
    ? sessions.filter((session) => {
        const searchableText = [
          session.title,
          ...session.messages.map((item) => item.content),
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedKeyword);
      })
    : sessions;

  return (
    <DrawerBox
      actionRef={actionRef}
      className="[&_.ant-spin]:!min-w-0 [&_.ant-spin]:!flex-1"
      closeIcon
      footer={null}
      placement="left"
      size="min(100vw, 500px)"
      styles={{
        body: { display: 'flex', minHeight: 0, padding: 0 },
        header: { padding: '14px 18px' },
      }}
      title="对话列表"
    >
      <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Input
            allowClear
            className="h-10 flex-1 rounded-xl border-slate-200 bg-slate-50 px-3 text-sm"
            placeholder="搜索"
            prefix={<SearchOutlined className="text-base text-slate-400" />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button
            className="shrink-0 rounded-lg px-1 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200"
            type="button"
            onClick={onCreateSession}
          >
            新会话
          </button>
        </div>

        <div className="mobile-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {filteredSessions.length > 0 ? (
            <div>
              {filteredSessions.map((session) => {
                const active = session.id === activeSessionId;
                const generating = session.id === runningSessionId;

                return (
                  <button
                    key={session.id}
                    aria-current={active ? 'true' : undefined}
                    className={`flex min-h-14 w-full items-center gap-3 border-b border-slate-100 px-4 text-left transition-colors last:border-b-0 ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                    }`}
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        active
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <MessageOutlined className="text-base" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {generating ? '正在生成回复…' : session.title}
                    </span>
                    <MoreOutlined
                      aria-hidden="true"
                      className="shrink-0 text-base text-slate-400"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              没有找到相关会话
            </div>
          )}
        </div>
      </div>
    </DrawerBox>
  );
}
