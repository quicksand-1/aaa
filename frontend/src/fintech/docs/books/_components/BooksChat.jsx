import { Button, Flex, Tooltip, Typography } from 'antd';
import { Xmessages, Xsender, createStorageSQLHistoryProvider } from 'fintech/x';
import { useMemo, useState } from 'react';
import { DEFAULT_AGENT_SESSION_STATE, runAgent } from './agent';
import { bookmarksByCategory } from './bookmarks';

const { Text } = Typography;

const openLink = (link = '') => {
  window.open(link);
};

// 业务内存在 atrust:// 这类自定义协议深链（如 VPN），需要在 Markdown 消毒时放行，
// 否则 DOMPurify 默认协议白名单会把 href 剥掉。仅在本业务的消息列表生效，不写入通用组件。
const MARKDOWN_PROPS = {
  dompurifyConfig: {
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix|atrust):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  },
};

const CATEGORY_META = {
  tools: {
    title: '开发工具',
    tone: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    borderColor: '#93c5fd',
  },
  ai: {
    title: 'AI 入口',
    tone: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderColor: '#86efac',
  },
  blj: {
    title: '堡垒机',
    tone: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    borderColor: '#f9a8d4',
  },
  env: {
    title: '应用环境',
    tone: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
    borderColor: '#fdba74',
  },
};

const SectionCard = ({
  title = '',
  subtitle = '',
  tone = '',
  borderColor = '',
  children,
}) => (
  <div
    style={{
      padding: 16,
      borderRadius: 18,
      border: `1px solid ${borderColor || '#e5e7eb'}`,
      background: tone || '#fff',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
    }}
  >
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Text strong style={{ fontSize: 15 }}>
          {title}
        </Text>
        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
      </Flex>
      {children}
    </Flex>
  </div>
);

const BookmarkButtons = ({ items = [], compact = false }) => (
  <Flex gap={compact ? 6 : 8} wrap>
    {items.map((item) => (
      <Tooltip
        key={`${item.group || item.category}-${item.name}-${item.link}`}
        title={
          item.tip ? (
            <div style={{ whiteSpace: 'pre-line' }}>{item.tip}</div>
          ) : null
        }
      >
        <Button
          size={compact ? 'small' : 'middle'}
          onClick={() => openLink(item.link)}
        >
          {item.name}
        </Button>
      </Tooltip>
    ))}
  </Flex>
);

const EmptyBookmarks = () => {
  const envGroups = Array.from(
    bookmarksByCategory.env.reduce((acc, item) => {
      const group = item.group || '其他';
      const current = acc.get(group) || [];
      current.push(item);
      acc.set(group, current);
      return acc;
    }, new Map()),
  ).map(([group, items]) => ({
    group,
    items,
  }));

  return (
    <Flex vertical gap={16} style={{ minHeight: 320 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        <SectionCard
          title={CATEGORY_META.tools.title}
          subtitle={`${bookmarksByCategory.tools.length} 个入口`}
          tone={CATEGORY_META.tools.tone}
          borderColor={CATEGORY_META.tools.borderColor}
        >
          <BookmarkButtons items={bookmarksByCategory.tools} compact />
        </SectionCard>

        <SectionCard
          title={CATEGORY_META.ai.title}
          subtitle={`${bookmarksByCategory.ai.length} 个入口`}
          tone={CATEGORY_META.ai.tone}
          borderColor={CATEGORY_META.ai.borderColor}
        >
          <BookmarkButtons items={bookmarksByCategory.ai} compact />
        </SectionCard>

        <SectionCard
          title={CATEGORY_META.blj.title}
          subtitle={`${bookmarksByCategory.blj.length} 个入口`}
          tone={CATEGORY_META.blj.tone}
          borderColor={CATEGORY_META.blj.borderColor}
        >
          <BookmarkButtons items={bookmarksByCategory.blj} compact />
        </SectionCard>
      </div>

      <SectionCard
        title={CATEGORY_META.env.title}
        subtitle={`${envGroups.length} 个系统分组`}
        tone={CATEGORY_META.env.tone}
        borderColor={CATEGORY_META.env.borderColor}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 10,
          }}
        >
          {envGroups.map((group) => (
            <div
              key={group.group}
              style={{
                padding: 12,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(251, 146, 60, 0.18)',
              }}
            >
              <Flex vertical gap={8}>
                <Flex justify="space-between" align="center" wrap gap={8}>
                  <Text strong>{group.group}</Text>
                  <Text type="secondary">{group.items.length} 个环境</Text>
                </Flex>
                <BookmarkButtons items={group.items} compact />
              </Flex>
            </div>
          ))}
        </div>
      </SectionCard>
    </Flex>
  );
};

export default ({ mode = 'page' }) => {
  const [messages, setMessages] = useState([]);
  const [running, setRunning] = useState(false);
  const [sessionState, setSessionState] = useState(DEFAULT_AGENT_SESSION_STATE);
  const isDrawer = mode === 'drawer';

  const historyProvider = useMemo(
    () =>
      createStorageSQLHistoryProvider({
        tablePrefix: 'books_chat_history',
        maxCount: 20,
        dedupe: true,
      }),
    [],
  );

  const bubbleItems = useMemo(() => {
    const items = messages.map((item) => ({
      key: item.key,
      role: item.role,
      type: item.type,
      content: item.answer || item.content || '',
      extraInfo: { item },
    }));

    if (running) {
      items.push({
        key: 'assistant-loading',
        role: 'assistant',
        status: 'loading',
        content: '助手正在查询中...',
      });
    }

    return items;
  }, [messages, running]);

  const appendAssistantMessage = (payload = {}) => {
    setMessages((prev) => [
      ...prev,
      {
        key: `${Date.now()}-assistant`,
        role: 'assistant',
        ...payload,
      },
    ]);
  };

  const handleSubmit = (currentQuestion = '') => {
    const question = currentQuestion.trim();

    if (!question || running) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        key: `${Date.now()}-user`,
        role: 'user',
        content: question,
      },
    ]);

    setRunning(true);

    runAgent({
      question,
      sessionState,
    })
      .then((result) => {
        setSessionState(result.sessionState || DEFAULT_AGENT_SESSION_STATE);
        appendAssistantMessage(result);
      })
      .catch((error) => {
        appendAssistantMessage({
          type: 'error',
          answer: error.message || '查询失败',
        });
      })
      .finally(() => {
        setRunning(false);
      });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isDrawer ? '100%' : undefined,
        minHeight: isDrawer ? 0 : 'calc(100vh - 180px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: 16,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
        }}
      >
        <Xmessages
          items={bubbleItems}
          markdownProps={MARKDOWN_PROPS}
          listProps={{
            style: {
              height: '100%',
            },
          }}
          slots={{
            empty: () => (
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <EmptyBookmarks />
              </div>
            ),
          }}
        />
      </div>

      <div
        style={{
          flex: 'none',
          padding: 16,
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div style={{ width: '100%' }}>
          <Xsender
            loading={running}
            historyProvider={historyProvider}
            onSubmit={(value) => handleSubmit(value.text)}
            placeholder="试试输入：Jenkins 地址、SkillHub 在哪、问数线上环境"
          />
        </div>
      </div>
    </div>
  );
};
