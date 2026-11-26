// 时间格式化。小程序没有 Intl，也没有稳定的日期字符串解析，所有时间入口都必须经过 parseDate。
function pad(value) {
  return String(value).length >= 2 ? String(value) : '0' + value;
}

// 后端时间形如 '2026-09-28T07:55:28.108754'（无时区、6 位小数秒），
// iOS 的 new Date(str) 对这种格式兼容性不一致，必须先按字段解析。
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  var matched = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:?\d{2})?$/
  );
  if (!matched) return new Date(value);
  var ms = (matched[7] || '0').slice(0, 3);
  var tz = matched[8];
  if (tz) {
    return new Date(matched[1] + '-' + matched[2] + '-' + matched[3] + 'T' + matched[4] + ':' + matched[5] + ':' + matched[6] + '.' + ms + (tz === 'Z' ? 'Z' : tz));
  }
  return new Date(
    Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]),
    Number(matched[4]), Number(matched[5]), Number(matched[6]), Number(ms)
  );
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// 消息区时间分隔文案：同一天只显示时间，跨天补上月日。
function formatDateSeparator(at, previousAt) {
  var time = pad(at.getHours()) + ':' + pad(at.getMinutes());
  return isSameDay(at, previousAt) ? time : (at.getMonth() + 1) + '月' + at.getDate() + '日 ' + time;
}

// 消息页脚时间：对齐 Web 端 intlDate.format 的 YYYY-MM-DD HH:mm:ss。
function formatDateTime(value) {
  var at = parseDate(value);
  if (!at || Number.isNaN(at.getTime())) return '';
  return at.getFullYear() + '-' + pad(at.getMonth() + 1) + '-' + pad(at.getDate())
    + ' ' + pad(at.getHours()) + ':' + pad(at.getMinutes()) + ':' + pad(at.getSeconds());
}

export { parseDate, formatDateSeparator, formatDateTime };
