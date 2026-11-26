---
group: 类
toc: content
order: 4
demo:
  cols: 2
---

# GlobalScheduler

全局任务队列调度器，无需实例化

<code title="自动触发" src="./_components/GlobalScheduler/demo1.jsx"></code>
<code title="手动触发" src="./_components/GlobalScheduler/demo2.jsx"></code>

## 新增任务

```js | pure
import { GlobalScheduler } from 'fintech';

const cancel = GlobalScheduler.add({
  id: '1', // 唯一标识，相同 id 会被覆盖
  action: () => {}, // 任务执行方法，必须返回 Promise
  queueName: 'demo', // 队列名称，相同任务队列名称应该相同；不同的队列名称，执行时相互隔离
  start: true, // 是否立即开始执行
  again: true, // 队列执行结束后，是否再把任务添加到队列里，只有 start = false 时有效
});

// 取消当前 id=1 的任务
cancel();

// 手动执行任务，搭配 start = false 使用
GlobalScheduler.start('demo');

// 监听
GlobalScheduler.listen(queueName, (state) => {
  if (state === 'end') {
    // 目前只支持 end 状态
  }
});
```
