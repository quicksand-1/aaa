// 为消息生成统一 key，供列表渲染和自动滚动共用。
// 对外约定使用 item.key；缺失时仅做兼容兜底，避免旧数据立刻失效。
export default function getMessageKey(item, index) {
  return item?.key ?? `message-${index}`;
}
