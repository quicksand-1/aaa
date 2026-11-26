import * as markdown from '../markdown';
import * as format from '../format';
import * as tools from './tools';

var TYPING_KEY = '__xmessages_typing__';

// 数量缩写：>=1000 转 k/M/B，保留 1~2 位小数并去掉尾随 .0（移植自 Web 端 MessageStatusFooter）
function formatNumber(num) {
  if (num < 1000) return String(num);
  var units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'k' }
  ];
  for (var i = 0; i < units.length; i += 1) {
    if (num >= units[i].value) {
      var scaled = num / units[i].value;
      var decimals = scaled >= 10 ? 1 : 2;
      return scaled.toFixed(decimals).replace(/\.0+$/, '') + units[i].suffix;
    }
  }
  return String(num);
}

// 时长缩写：Xs / XmYs / Xh / Xd / Xmo / Xy（移植自 Web 端 MessageStatusFooter）
function formatTime(seconds) {
  var total = Math.floor(seconds);
  if (total < 60) return total + 's';
  if (total < 3600) {
    var minutes = Math.floor(total / 60);
    var remaining = total % 60;
    return remaining === 0 ? minutes + 'm' : minutes + 'm' + remaining + 's';
  }
  if (total < 86400) return Math.floor(total / 3600) + 'h';
  if (total < 2629746) return Math.floor(total / 86400) + 'd';
  if (total < 31556952) return Math.floor(total / 2629746) + 'mo';
  return Math.floor(total / 31556952) + 'y';
}

function getMessageKey(item, index) {
  if (item && item.key !== undefined && item.key !== null && item.key !== '') {
    return String(item.key);
  }
  if (item && item.id !== undefined && item.id !== null && item.id !== '') {
    return String(item.id);
  }
  return 'message-' + index;
}

function normalizeRoleName(role) {
  return String(role || '').toLowerCase();
}

function resolvePlacement(item) {
  if (item && (item.placement === 'start' || item.placement === 'end')) {
    return item.placement;
  }
  return normalizeRoleName(item && item.role) === 'user' || (item && item.isUser) ? 'end' : 'start';
}

function normalizeStatus(status) {
  var normalized = String(status || '').toLowerCase();
  if (normalized === 'running') {
    return 'loading';
  }
  if (normalized === 'completed') {
    return 'success';
  }
  if (normalized === 'failed') {
    return 'error';
  }
  return normalized;
}

function resolveContent(item) {
  if (item && item.content !== undefined) {
    return item.content;
  }
  return item && item.text !== undefined ? item.text : '';
}

function resolveType(item, content) {
  if (item && item.type === 'date_separator') {
    return 'date_separator';
  }
  if (item && item.type === 'user_attachment') {
    return 'attachments';
  }
  if (item && item.type && item.type !== 'agent_response') {
    return item.type;
  }
  if (item && ((Array.isArray(item.blocks) && item.blocks.length) || (item.blocks && Array.isArray(item.blocks.contentBlocks)))) {
    return 'blocks';
  }
  if (normalizeRoleName(item && item.role) === 'user' || (item && item.isUser)) {
    return 'text';
  }
  return typeof content === 'string' || typeof content === 'number' ? 'markdown' : 'empty';
}

function resolveNodes(type, content) {
  if (type === 'markdown' && (typeof content === 'string' || typeof content === 'number')) {
    return markdown.parse(String(content));
  }
  return [];
}

// 与 Web 端 MessageCopyButton 一致：优先复制正文文本块，纯文本消息回落到 content。
function getCopyableText(item) {
  var contentBlocks = item && item.blocks && item.blocks.contentBlocks;
  if (Array.isArray(contentBlocks)) {
    var text = contentBlocks.filter(function (block) {
      return block && block.type === 'text';
    }).map(function (block) {
      return block.text || '';
    }).filter(Boolean).join('\n\n');
    if (text) return text;
  }
  return item && typeof item.content === 'string' ? item.content : '';
}

// 只判断能否复制，避免流式刷新时反复拼接整段正文。
function hasCopyableText(item) {
  var contentBlocks = item && item.blocks && item.blocks.contentBlocks;
  if (Array.isArray(contentBlocks)) {
    for (var i = 0; i < contentBlocks.length; i += 1) {
      var block = contentBlocks[i];
      if (block && block.type === 'text' && String(block.text || '').trim()) return true;
    }
  }
  return Boolean(item && typeof item.content === 'string' && item.content.trim());
}

function normalizeExtraInfo(item) {
  var source = item && item.extraInfo && typeof item.extraInfo === 'object'
    ? item.extraInfo
    : {};
  var thinking = source.thinking || null;
  if (!thinking && item && item.blocks && Array.isArray(item.blocks.thinking) && item.blocks.thinking.length) {
    thinking = {
      content: item.blocks.thinking.map(function (block) { return block && (block.thinking || block.text || block.content || ''); }).join(''),
      expanded: false
    };
  }

  return {
    thinking: thinking,
    statusText: source.statusText || '',
    statusMuted: source.statusMuted === true,
    errorMessage: source.errorMessage || ''
  };
}

function normalizeMeta(item) {
  var source = item && item.meta && typeof item.meta === 'object' ? item.meta : {};
  return {
    label: source.label || (item && item.roleLabel) || '',
    timeText: source.timeText || (item && item.timeText) || ''
  };
}

function normalizeContentBlocks(item, backgroundContext) {
  var source = item && item.blocks;
  if (source && Array.isArray(source.contentBlocks)) {
    return source.contentBlocks.map(function (block, index) {
      if (!block) return { type: 'text', key: 'block-' + index, text: '' };
      // 正文块是模型输出的 Markdown，解析成 rich-text 节点交给 WXML 的 rich 分支渲染
      if (block.type === 'text') {
        var text = block.text || '';
        return { type: 'rich', key: block.key || ('block-' + index), nodes: markdown.parse(text) };
      }
      if (block.type === 'tool') {
        return tools.normalizeToolBlock(block, index, backgroundContext);
      }
      return block;
    });
  }
  return Array.isArray(source) ? source : [];
}

function thinkingContent(blocks) {
  return (blocks || []).map(function (block) {
    return block && (block.thinking || block.text || block.content || '');
  }).filter(Boolean).join('\n\n');
}

// 按原始 ordered 顺序分组：连续思考合并为一个折叠块，连续工具合并为一个工具组。
function buildRenderGroups(item, normalizedBlocks) {
  var source = item && item.blocks;
  var ordered = source && Array.isArray(source.ordered) ? source.ordered : null;
  var groups = [];
  var toolRun = [];
  var thinkingRun = [];

  function flushTools() {
    if (!toolRun.length) return;
    groups.push(tools.buildToolGroup(toolRun, item && item.key, groups.length));
    toolRun = [];
  }

  function flushThinking() {
    if (!thinkingRun.length) return;
    var content = thinkingContent(thinkingRun) || '（思考中...）';
    groups.push({
      type: 'thinking',
      key: (item && item.key) + '-thinking-' + groups.length,
      content: content,
      expanded: false
    });
    thinkingRun = [];
  }

  function appendContent(block) {
    if (!block) return;
    if (block.type === 'tool') {
      toolRun.push(block);
      return;
    }
    flushTools();
    groups.push({
      type: 'block',
      key: (block.key || 'block') + '-group',
      block: block
    });
  }

  if (ordered && ordered.length) {
    var blockCursor = 0;
    ordered.forEach(function (entry) {
      if (entry && entry.type === 'thinking') {
        flushTools();
        thinkingRun.push(entry.block || entry);
        return;
      }
      flushThinking();
      appendContent(normalizedBlocks[blockCursor]);
      blockCursor += 1;
    });
  } else {
    normalizedBlocks.forEach(appendContent);
    var fallbackThinking = source && Array.isArray(source.thinking) ? source.thinking : [];
    if (fallbackThinking.length) {
      flushTools();
      thinkingRun = fallbackThinking.slice();
      flushThinking();
    }
  }

  flushThinking();
  flushTools();
  return groups;
}

function normalizeItem(item, index, now, backgroundContext) {
  var content = resolveContent(item);
  var type = resolveType(item, content);
  var placement = resolvePlacement(item);
  var status = normalizeStatus(item && item.status);
  var error = item && item.error;
  var extraInfo = normalizeExtraInfo(item);
  var normalizedBlocks = normalizeContentBlocks(item, backgroundContext);
  if (error && !extraInfo.errorMessage) extraInfo.errorMessage = typeof error === 'string' ? error : (error.message || '');
  return {
    key: getMessageKey(item, index),
    sourceIndex: index,
    role: (item && item.role) || ((item && item.isUser) ? 'user' : 'assistant'),
    type: type,
    content: content === undefined || content === null ? '' : String(content),
    status: status,
    placement: placement,
    isEnd: placement === 'end',
    typing: !!(item && item.typing),
    nodes: resolveNodes(type, content),
    blocks: normalizedBlocks,
    renderGroups: buildRenderGroups(item, normalizedBlocks),
    attachments: item && item.blocks && Array.isArray(item.blocks.data) ? item.blocks.data : [],
    meta: normalizeMeta(item),
    extraInfo: extraInfo,
    footer: buildFooter(item, status, now),
    error: error || null
  };
}

// 消息脚标（移植自 Web 端 chat footer）：用户消息展示创建时间；助手消息展示
// 状态、完成时间/耗时、token 用量和复制入口。
function buildFooter(item, status, now) {
  if (!item) return null;
  var created = item.created_at;
  var start = created ? format.parseDate(created) : null;
  var createdText = format.formatDateTime(start);
  if (!start || !createdText) return null;

  var role = normalizeRoleName(item.role);
  if (!role && item.isUser) role = 'user';
  var canCopy = status !== 'loading' && hasCopyableText(item);

  if (role === 'user') {
    return {
      showStatus: false,
      state: 'success',
      timeText: createdText,
      detailText: '',
      hasUsage: false,
      inText: '0',
      outText: '0',
      canCopy: canCopy
    };
  }
  if (role !== 'assistant') return null;

  var isRunning = status === 'loading';
  var finished = item.finished_at ? format.parseDate(item.finished_at) : null;
  var hasFinishedAt = !isRunning && Boolean(finished) && !Number.isNaN(finished.getTime());
  var endMs;
  if (isRunning) {
    endMs = typeof now === 'number' ? now : Date.now();
  } else {
    endMs = hasFinishedAt ? finished.getTime() : start.getTime();
  }
  var elapsedSeconds = Math.max(0, (endMs - start.getTime()) / 1000);
  var elapsedText = formatTime(elapsedSeconds);
  var finishedText = hasFinishedAt ? format.formatDateTime(finished) : '';

  var usage = item.usage || {};
  var inputTokens = usage.input_tokens || 0;
  var outputTokens = usage.output_tokens || 0;

  return {
    showStatus: true,
    state: isRunning ? 'loading' : (status === 'error' ? 'error' : 'success'),
    timeText: hasFinishedAt ? finishedText : elapsedText,
    detailText: hasFinishedAt
      ? '创建时间：' + createdText + '\n结束时间：' + finishedText + '\n响应时间：' + elapsedText
      : '',
    hasUsage: inputTokens > 0 || outputTokens > 0,
    inText: formatNumber(inputTokens),
    outText: formatNumber(outputTokens),
    canCopy: canCopy
  };
}

function createTypingItem() {
  return {
    key: TYPING_KEY,
    role: 'system',
    type: 'status',
    content: '',
    status: 'loading',
    placement: 'start',
    isEnd: false,
    typing: false,
    nodes: [],
    blocks: [],
    meta: { label: '', timeText: '' },
    extraInfo: {
      thinking: null,
      statusText: '',
      statusMuted: false,
      errorMessage: ''
    }
  };
}

function applyTyping(items, options) {
  var settings = options || {};
  var index;
  if (!settings.typing) {
    return items;
  }
  for (index = items.length - 1; index >= 0; index -= 1) {
    if (normalizeRoleName(items[index].role) !== 'user' && items[index].status === 'loading') {
      var typingItem = items[index];
      items = items.slice();
      items[index] = Object.assign({}, typingItem, { typing: true });
      return items;
    }
  }
  items = items.slice();
  items.push(createTypingItem());
  return items;
}

function buildBubbleItems(options) {
  var settings = options || {};
  var source = Array.isArray(settings.items) ? settings.items : [];
  var backgroundContext = {
    tasks: Array.isArray(settings.backgroundTasks) ? settings.backgroundTasks : [],
    results: settings.backgroundTaskResults && typeof settings.backgroundTaskResults === 'object'
      ? settings.backgroundTaskResults
      : {}
  };
  var items = source.map(function (item, index) {
    return normalizeItem(item, index, settings.now, backgroundContext);
  });
  return applyTyping(items, settings);
}

export { buildBubbleItems, getCopyableText };
