/**
 * SSE (Server-Sent Events) fetch 工具
 * 用于处理服务端推送的流式数据
 */

export interface SSEOptions extends RequestInit {
  /**
   * SSE 事件回调
   * @param event 事件类型
   * @param data 数据内容（已尝试 JSON 解析）
   */
  callback: (event: string, data: unknown) => void;
}

export interface SSEResponse {
  /**
   * 取消 SSE 连接
   */
  cancel: () => void;
  /**
   * Promise 在连接完成或出错时 resolve
   */
  done: Promise<void>;
}

/**
 * 解析 SSE 行数据
 */
function parseSSELine(line: string): {
  type: 'event' | 'data' | 'other';
  value: string;
} {
  if (line.startsWith('event:')) {
    return { type: 'event', value: line.slice(6).trim() };
  }
  if (line.startsWith('data:')) {
    return { type: 'data', value: line.slice(5).trim() };
  }
  return { type: 'other', value: line };
}

/**
 * 尝试解析 JSON，失败则返回原始字符串
 */
function tryParseJSON(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

/**
 * SSE fetch 方法
 * @param url 请求地址
 * @param options 请求选项，包含 callback 回调
 * @returns 返回包含 cancel 和 done 的对象
 */
export function fetchSSE(url: string, options: SSEOptions): SSEResponse {
  const { callback, ...fetchOptions } = options;

  let currentEvent = 'message';
  let currentData: string[] = [];
  let isCancelled = false;
  let resolveDone: () => void;
  let rejectDone: (error: Error) => void;

  const done = new Promise<void>((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });

  const abortController = new AbortController();
  const signal = abortController.signal;

  const cancel = () => {
    isCancelled = true;
    abortController.abort();
  };

  // 发送当前累积的事件
  const emitEvent = () => {
    if (currentData.length > 0) {
      const dataStr = currentData.join('\n');
      const parsedData = tryParseJSON(dataStr);
      callback(currentEvent, parsedData);
      currentData = [];
      currentEvent = 'message';
    }
  };

  fetch(url, { ...fetchOptions, signal })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const processChunk = (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          // 空行表示事件结束
          if (trimmedLine === '') {
            emitEvent();
            continue;
          }

          const { type, value } = parseSSELine(trimmedLine);

          if (type === 'event') {
            currentEvent = value;
          } else if (type === 'data') {
            currentData.push(value);
          }
          // 忽略其他类型的行（如 id:, retry: 等）
        }
      };

      const read = (): Promise<void> => {
        if (isCancelled) {
          reader.cancel();
          resolveDone();
          return Promise.resolve();
        }

        return reader.read().then(({ done: isDone, value }) => {
          if (isDone) {
            // 处理剩余的缓冲区
            if (buffer.trim()) {
              processChunk('\n');
            }
            emitEvent();
            resolveDone();
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          processChunk(chunk);
          return read();
        });
      };

      return read();
    })
    .catch((error) => {
      if (error.name === 'AbortError' || isCancelled) {
        resolveDone();
      } else {
        rejectDone(error);
      }
    });

  return { cancel, done };
}

export default fetchSSE;
