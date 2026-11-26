const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * SQLite 没有 DATETIME 类型，时间统一存 'YYYY-MM-DD HH:mm:ss' 文本。
 * 固定格式保证字典序等于时间序，比较和排序不需要额外处理。
 * 不使用 CURRENT_TIMESTAMP：它返回 UTC，会和本地时间混在一起导致会话过期判断出错。
 */
export function sqlNow(offsetMinutes = 0): string {
  const date = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export function sqlNowPlusHours(hours: number): string {
  return sqlNow(hours * 60);
}
