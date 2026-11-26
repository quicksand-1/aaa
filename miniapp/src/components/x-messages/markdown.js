// utils/markdown.js - 轻量级 Markdown 渲染
// 支持：标题(#/##/###)、加粗(**text**)、斜体(*text*)、行内代码(`code`)、代码块(```)、
//      有序列表(1. 2.)、无序列表(- *)、链接([text](url))、脚注 superscript 链接、
//      Markdown 表格、块级图片、段落、空行

import { BASE_URL, ORIGIN } from './api';

var IMAGE_MISSING_TEXT = '图片不存在或已丢失';

function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

function isRootRelativeUrl(url) {
  return typeof url === 'string' && url.indexOf('/') === 0;
}

function buildAbsoluteUrl(path) {
  if (!path) {
    return '';
  }
  if (isAbsoluteUrl(path)) {
    return path;
  }
  if (isRootRelativeUrl(path)) {
    return ORIGIN + path;
  }
  return BASE_URL + '/' + path.replace(/^\/+/, '');
}

function parseTableRow(line) {
  var normalized = (line || '').trim();
  if (!normalized) {
    return [];
  }
  if (normalized[0] === '|') {
    normalized = normalized.slice(1);
  }
  if (normalized[normalized.length - 1] === '|') {
    normalized = normalized.slice(0, -1);
  }
  return normalized.split('|').map(function (cell) {
    return cell.trim();
  });
}

function isTableDelimiterLine(line) {
  var cells = parseTableRow(line);
  if (!cells.length) {
    return false;
  }
  return cells.every(function (cell) {
    return /^:?-{3,}:?$/.test(cell);
  });
}

function buildTableNode(headerCells, bodyRows) {
  return {
    name: 'div',
    attrs: {
      style: 'margin:24rpx 0;border:1px solid #dfe9e2;border-radius:18rpx;overflow:hidden;background:#ffffff;box-shadow:0 8rpx 24rpx rgba(15, 42, 29, 0.05);'
    },
    children: [{
      name: 'div',
      attrs: {
        style: 'overflow-x:auto;-webkit-overflow-scrolling:touch;'
      },
      children: [{
        name: 'table',
        attrs: {
          style: 'width:max-content;min-width:100%;border-collapse:separate;border-spacing:0;font-size:24rpx;line-height:1.65;color:#38463f;background:#ffffff;table-layout:auto;'
        },
        children: [{
          name: 'thead',
          children: [{
            name: 'tr',
            children: headerCells.map(function (cell, columnIndex) {
              return {
                name: 'th',
                attrs: {
                  style: 'padding:18rpx 20rpx;border-right:'
                    + (columnIndex === headerCells.length - 1 ? '0' : '1px solid #dfe9e2')
                    + ';border-bottom:1px solid #dfe9e2;background:#f4f8f5;text-align:left;font-weight:600;vertical-align:top;white-space:nowrap;position:sticky;top:0;'
                },
                children: parseInline(cell)
              };
            })
          }]
        }, {
          name: 'tbody',
          children: bodyRows.map(function (row, rowIndex) {
            return {
              name: 'tr',
              children: row.map(function (cell, columnIndex) {
                return {
                  name: 'td',
                  attrs: {
                    style: 'padding:16rpx 20rpx;border-right:'
                      + (columnIndex === row.length - 1 ? '0' : '1px solid #e9f0eb')
                      + ';border-bottom:'
                      + (rowIndex === bodyRows.length - 1 ? '0' : '1px solid #e9f0eb')
                      + ';vertical-align:top;background:'
                      + (rowIndex % 2 === 0 ? '#ffffff' : '#ffffff')
                      + ';min-width:176rpx;word-break:break-word;white-space:pre-wrap;'
                  },
                  children: parseInline(cell || '--')
                };
              })
            };
          })
        }]
      }]
    }]
  };
}

// 图片 src 归一化：绝对 URL 与根相对路径可直接渲染，其余（含不存在的网络路径）一律按缺失处理。
function resolveImageSrc(src) {
  var normalizedSrc = (src || '').trim();
  if (!normalizedSrc) return '';
  if (isAbsoluteUrl(normalizedSrc)) return normalizedSrc;
  if (isRootRelativeUrl(normalizedSrc)) return buildAbsoluteUrl(normalizedSrc);
  return '';
}

function buildImageNode(altText, src) {
  var resolvedSrc = resolveImageSrc(src);
  var children = [];
  if (resolvedSrc) {
    children.push({
      name: 'img',
      attrs: {
        src: resolvedSrc,
        alt: altText || '',
        style: 'display:block;width:100%;height:auto;border-radius:16rpx;background:#f4f8f5;border:1px solid #dfe9e2;'
      }
    });
    if (altText) {
      children.push({
        name: 'div',
        attrs: {
          style: 'margin-top:12rpx;font-size:24rpx;line-height:1.5;color:#5c6b63;text-align:center;'
        },
        children: [{ type: 'text', text: altText }]
      });
    }
    return {
      name: 'div',
      attrs: {
        style: 'margin:24rpx 0;'
      },
      children: children
    };
  }

  return {
    name: 'div',
    attrs: {
      style: 'margin:24rpx 0;padding:24rpx;border-radius:16rpx;border:1px dashed #c3d2c9;background:#f4f8f5;color:#5c6b63;font-size:24rpx;line-height:1.6;'
    },
    children: [{ type: 'text', text: IMAGE_MISSING_TEXT }]
  };
}

/**
 * 把 Markdown 文本转成小程序 rich-text 用的 nodes 数组
 * @param {string} md
 * @returns {Array} rich-text nodes
 */
function parse(md) {
  if (!md) return [];
  const lines = md.split('\n');
  const nodes = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let listBuffer = null;  // 'ul' | 'ol' | null
  let paragraphBuffer = [];
  let listBufferItems = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(' ').trim();
    if (text) {
      nodes.push({
        name: 'div',
        attrs: { class: 'md-p' },
        children: parseInline(text)
      });
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer) return;
    nodes.push({
      name: listBuffer === 'ul' ? 'ul' : 'ol',
      attrs: { class: 'md-list' },
      children: listBufferItems.map(function (text) {
        return {
          name: 'li',
          attrs: { class: 'md-li' },
          children: parseInline(text)
        };
      })
    });
    listBuffer = null;
    listBufferItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';

    // 代码块
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        nodes.push({
          name: 'pre',
          attrs: { class: 'md-pre' },
          children: [{
            name: 'code',
            attrs: { class: 'md-codeblock' },
            children: [{ type: 'text', text: codeBuffer.join('\n') }]
          }]
        });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 空行：结束段落/列表
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    // 标题
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      flushParagraph();
      flushList();
      const level = hMatch[1].length;
      nodes.push({
        name: 'h' + level,
        attrs: { class: 'md-h' + level },
        children: parseInline(hMatch[2].trim())
      });
      continue;
    }

    // 表格
    if (line.indexOf('|') >= 0 && isTableDelimiterLine(nextLine)) {
      var headerCells = parseTableRow(line);
      var bodyRows = [];
      flushParagraph();
      flushList();
      i += 2;
      while (i < lines.length && lines[i].trim().indexOf('|') >= 0) {
        bodyRows.push(parseTableRow(lines[i]));
        i += 1;
      }
      nodes.push(buildTableNode(headerCells, bodyRows));
      i -= 1;
      continue;
    }

    // 块级图片
    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      nodes.push(buildImageNode(imageMatch[1].trim(), imageMatch[2].trim()));
      continue;
    }

    // 无序列表
    const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (listBuffer !== 'ul') {
        flushList();
        listBuffer = 'ul';
      }
      listBufferItems.push(ulMatch[1].trim());
      continue;
    }

    // 有序列表
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (listBuffer !== 'ol') {
        flushList();
        listBuffer = 'ol';
      }
      listBufferItems.push(olMatch[1].trim());
      continue;
    }

    // 普通段落行
    flushList();
    paragraphBuffer.push(line.trim());
  }

  // 收尾
  if (inCodeBlock && codeBuffer.length) {
    nodes.push({
      name: 'pre',
      attrs: { class: 'md-pre' },
      children: [{
        name: 'code',
        attrs: { class: 'md-codeblock' },
        children: [{ type: 'text', text: codeBuffer.join('\n') }]
      }]
    });
  }
  flushParagraph();
  flushList();

  return nodes;
}

/**
 * 行内解析：加粗 / 斜体 / 行内代码 / 链接
 */
function parseInline(text) {
  const out = [];
  let buf = '';
  let i = 0;

  const flush = () => {
    if (buf) {
      out.push({ type: 'text', text: buf });
      buf = '';
    }
  };

  while (i < text.length) {
    // enterprise-wiki-web 风格的脚注链接：<sup><a href="...">[1]</a></sup>
    if (text.slice(i).indexOf('<sup><a ') === 0) {
      var supLinkMatch = text
        .slice(i)
        .match(/^<sup><a href="([^"]+)"(?:\s+[^>]*)?>([^<]+)<\/a><\/sup>/);
      if (supLinkMatch) {
        flush();
        out.push({
          name: 'sup',
          attrs: { class: 'md-sup' },
          children: [{
            name: 'a',
            attrs: { class: 'md-link md-sup-link', href: supLinkMatch[1] },
            children: [{ type: 'text', text: supLinkMatch[2] }]
          }]
        });
        i += supLinkMatch[0].length;
        continue;
      }
    }
    // 行内代码
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i) {
        flush();
        out.push({
          name: 'code',
          attrs: { class: 'md-inline-code' },
          children: [{ type: 'text', text: text.slice(i + 1, end) }]
        });
        i = end + 1;
        continue;
      }
    }
    // 加粗
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end > i + 1) {
        flush();
        out.push({
          name: 'strong',
          attrs: { class: 'md-bold' },
          children: [{ type: 'text', text: text.slice(i + 2, end) }]
        });
        i = end + 2;
        continue;
      }
    }
    // 斜体
    if (text[i] === '*') {
      const end = text.indexOf('*', i + 1);
      if (end > i && text[end + 1] !== '*') {
        flush();
        out.push({
          name: 'em',
          attrs: { class: 'md-em' },
          children: [{ type: 'text', text: text.slice(i + 1, end) }]
        });
        i = end + 1;
        continue;
      }
    }
    // 链接
    if (text[i] === '[') {
      const labelEnd = text.indexOf(']', i + 1);
      if (labelEnd > i && text[labelEnd + 1] === '(') {
        const urlEnd = text.indexOf(')', labelEnd + 2);
        if (urlEnd > labelEnd) {
          flush();
          out.push({
            name: 'a',
            attrs: { class: 'md-link', href: text.slice(labelEnd + 2, urlEnd) },
            children: [{ type: 'text', text: text.slice(i + 1, labelEnd) }]
          });
          i = urlEnd + 1;
          continue;
        }
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return out;
}

export { parse };
