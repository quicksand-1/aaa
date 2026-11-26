import React, { isValidElement } from 'react';
import Xmarkdown from '../Xmarkdown';

export default function MessageContent({
  item,
  renderers = {},
  markdownProps,
}) {
  // 渲染优先级：
  // 1. 优先命中 item.type 对应的业务 render 函数
  const render = renderers[item?.type];

  if (render) {
    return render({ item });
  }

  // 已经是 ReactElement 的内容，说明调用方已经完全决定了渲染结果，直接返回即可。
  if (isValidElement(item?.content)) {
    return item.content;
  }

  if (typeof item?.content === 'string' || typeof item?.content === 'number') {
    // 默认把纯文本交给 Xmarkdown：
    // - 聊天消息普遍是文本，直接支持 markdown/latex 更符合预期
    // - number 先转成字符串，避免 Xmarkdown 接收非字符串类型
    return <Xmarkdown content={String(item.content)} {...markdownProps} />;
  }

  // 其余结构（如对象、数组）如果没有显式 renderer，不做猜测式渲染，避免输出不可控内容。
  return null;
}
