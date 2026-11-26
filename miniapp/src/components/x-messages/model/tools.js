// 工具消息的展示归一化：对齐 Web 端 ToolMessage 的摘要、耗时、状态和详情结构。
import * as format from '../format';

function toolResultText(result) {
  var output = result && result.output;
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) {
    return output.map(function (block) {
      return block && block.type === 'text' ? (block.text || '') : '';
    }).join('\n');
  }
  return '';
}

function parseInput(input) {
  if (input && typeof input === 'object') return input;
  try {
    var parsed = JSON.parse(String(input || ''));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function fileName(filePath) {
  var segments = String(filePath || '').split(/[/\\]+/).filter(Boolean);
  return segments.length ? segments[segments.length - 1] : '';
}

function resultDiff(result) {
  var diff = result && result.metadata && result.metadata.diff;
  return typeof diff === 'string' && diff ? diff : '';
}

function diffStats(diff) {
  var insertions = 0;
  var deletions = 0;
  String(diff || '').split('\n').forEach(function (line) {
    if (line.indexOf('+') === 0 && line.indexOf('+++') !== 0) insertions += 1;
    else if (line.indexOf('-') === 0 && line.indexOf('---') !== 0) deletions += 1;
  });
  return { insertions: insertions, deletions: deletions };
}

function resolveStateKey(call, result) {
  var callState = String((call && call.state) || '').toLowerCase();
  var resultState = String((result && result.state) || '').toLowerCase();
  if (callState === 'running') return 'running';
  if (callState === 'asking') return 'asking';
  if (resultState === 'error') return 'error';
  return 'done';
}

function resolveBackground(call, result, context) {
  var settings = context || {};
  var toolCallId = call && call.id ? String(call.id) : '';
  var tasks = Array.isArray(settings.tasks) ? settings.tasks : [];
  var results = settings.results && typeof settings.results === 'object' ? settings.results : {};
  var task = null;
  if (toolCallId) {
    for (var i = 0; i < tasks.length; i += 1) {
      if (tasks[i] && String(tasks[i].tool_call_id || '') === toolCallId) {
        task = tasks[i];
        break;
      }
    }
  }

  var resultState = toolCallId && Object.prototype.hasOwnProperty.call(results, toolCallId)
    ? String(results[toolCallId] || '').toLowerCase()
    : '';
  var placeholder = toolResultText(result).indexOf('is running in background') >= 0;
  var label = '';
  if (task) label = '后台运行中';
  else if (resultState === 'completed') label = '已在后台完成';
  else if (resultState === 'failed') label = '后台执行失败';
  else if (resultState === 'cancelled') label = '已停止';
  else if (placeholder) label = '已转入后台执行';

  var stateKey = resolveStateKey(call, result);
  if (task) stateKey = 'running';
  else if (resultState === 'completed') stateKey = 'done';
  else if (resultState === 'failed') stateKey = 'error';
  else if (resultState === 'cancelled') stateKey = 'interrupted';

  return { label: label, stateKey: stateKey };
}

function toolDuration(call, result) {
  var start = call && call.created_at ? format.parseDate(call.created_at) : null;
  var endSource = (result && (result.finished_at || result.created_at)) || (call && call.finished_at);
  var end = endSource ? format.parseDate(endSource) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() < start.getTime()) {
    return '';
  }
  var duration = end.getTime() - start.getTime();
  if (duration < 1000) return duration + 'ms';
  if (duration < 60 * 1000) return (duration / 1000).toFixed(1) + 's';
  var seconds = Math.round(duration / 1000);
  return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
}

function toolHeader(call, result) {
  var name = call.name || 'tool';
  var input = parseInput(call.input);
  var header = { label: '调用工具', argument: name, metaText: '' };

  if (name === 'Bash') {
    header.label = 'Bash';
    header.argument = typeof input.command === 'string' && input.command ? input.command : (call.input || '');
  } else if (name === 'Read') {
    header.label = 'Read';
    header.argument = fileName(input.file_path) || input.file_path || '';
    if (result && result.state === 'success') {
      var output = toolResultText(result);
      header.metaText = (output ? output.split('\n').length : 0) + ' 行';
    }
  } else if (name === 'Write' || name === 'Edit') {
    header.label = name;
    header.argument = fileName(input.file_path) || input.file_path || '';
  } else if (name === 'Grep' || name === 'Glob') {
    header.label = name + ' pattern';
    header.argument = typeof input.pattern === 'string' && input.pattern ? input.pattern : (call.input || '');
  } else if (name === 'TaskCreate') {
    header.label = 'Create task';
    var taskId = toolResultText(result).match(/^Task \(id=(\d+)\)/);
    header.argument = (taskId ? '#' + taskId[1] + ' ' : '') + (input.subject || input.task || '(untitled)');
  }
  return header;
}

function toolBody(call, result, backgroundLabel) {
  if (backgroundLabel || !result || result.state === 'running' || call.state === 'running') {
    return { hasBody: false, text: '' };
  }

  var name = call.name || '';
  var input = parseInput(call.input);
  var output = toolResultText(result);
  var diff = resultDiff(result);
  var sections = [];

  if (name === 'Bash') {
    var inputText = Object.keys(input).length ? JSON.stringify(input, null, 2) : String(call.input || '');
    if (inputText) sections.push('Input\n' + inputText);
    if (output) sections.push('Output\n' + output);
  } else if (name === 'Read') {
    if (input.file_path) sections.push(String(input.file_path));
    if (output) sections.push(output);
  } else if (name === 'Write' || name === 'Edit') {
    if (input.file_path) sections.push(String(input.file_path));
    if (result.state === 'success' && diff) sections.push(diff);
    else if (output) sections.push(output);
  } else if (name === 'TaskCreate') {
    if (input.description) sections.push(String(input.description));
  } else if (output) {
    sections.push(output);
  }

  var bodyText = sections.filter(Boolean).join('\n\n');
  return { hasBody: Boolean(bodyText), text: bodyText };
}

function normalizeToolBlock(block, index, backgroundContext) {
  var call = block.call || {};
  var result = block.result || null;
  var background = resolveBackground(call, result, backgroundContext);
  var header = toolHeader(call, result);
  var stats = diffStats(resultDiff(result));
  var body = toolBody(call, result, background.label);
  var canExpand = body.hasBody && !background.label;
  return {
    type: 'tool',
    key: block.key || ('block-' + index),
    call: call,
    result: result,
    groupExpanded: block.groupExpanded === true,
    backgroundLabel: background.label,
    stateKey: background.stateKey,
    running: background.stateKey === 'running' || background.stateKey === 'asking',
    label: header.label,
    argument: header.argument,
    metaText: header.metaText,
    durationText: background.label ? '' : toolDuration(call, result),
    diffInsertions: stats.insertions,
    diffDeletions: stats.deletions,
    hasBody: canExpand,
    bodyText: body.text
  };
}

function summarize(calls) {
  var counts = { Bash: 0, Read: 0, Edit: 0, Search: 0, Task: 0, MCP: 0 };
  var insertions = 0;
  var deletions = 0;
  calls.forEach(function (tool) {
    var name = (tool.call && tool.call.name) || '';
    if (name === 'Bash') counts.Bash += 1;
    else if (name === 'Read') counts.Read += 1;
    else if (name === 'Write' || name === 'Edit') counts.Edit += 1;
    else if (name === 'Grep' || name === 'Glob') counts.Search += 1;
    else if (name === 'TaskGet' || name === 'TaskUpdate' || name === 'TaskList' || name === 'TaskCreate') counts.Task += 1;
    else if (name.indexOf('mcp__') === 0) counts.MCP += 1;
    insertions += tool.diffInsertions || 0;
    deletions += tool.diffDeletions || 0;
  });

  var parts = [];
  if (counts.Bash) parts.push(counts.Bash + ' 次 Bash');
  if (counts.Read) parts.push(counts.Read + ' 次读取');
  if (counts.Edit) parts.push(counts.Edit + ' 次文件修改');
  if (counts.Search) parts.push(counts.Search + ' 次搜索');
  if (counts.Task) parts.push(counts.Task + ' 项任务');
  if (counts.MCP) parts.push(counts.MCP + ' 个 MCP 工具');

  return {
    title: parts.length ? parts.join(' · ') : calls.length + ' 次工具调用',
    insertions: insertions,
    deletions: deletions
  };
}

function buildToolGroup(calls, messageKey, index) {
  var summary = summarize(calls);
  var first = calls[0] || {};
  return {
    type: 'tools',
    key: messageKey + '-tools-' + index,
    blockKey: first.key || '',
    expanded: first.groupExpanded === true,
    running: calls.some(function (tool) { return tool.running === true; }),
    title: summary.title,
    insertions: summary.insertions,
    deletions: summary.deletions,
    hasDiff: summary.insertions > 0 || summary.deletions > 0,
    calls: calls
  };
}

export { normalizeToolBlock, buildToolGroup };
