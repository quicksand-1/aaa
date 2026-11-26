class GlobalScheduler {
  constructor() {
    this.activeTasks = new Map(); // 任务映射表
    this.queues = new Map(); // 任务队列映射表
    this.callback = new Map(); // 任务队列执行结束回调的映射表
  }

  /**
   * 自定义监听函数
   * todo：这里还需要完善，应该有各种状态的监听事件
   * */
  listen(queueName, callback) {
    this.callback.set(queueName, callback);
  }

  /**
   * 获取队列信息，如果没有，则初始化
   * */
  getQueue(queueName) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, {
        tasks: [],
        isRunning: false,
        againTasks: [],
      });
    }
    return this.queues.get(queueName);
  }

  /**
   * 添加任务
   * @id：唯一标识符
   * @action<Function>：必须返回一个promise
   * @queueName<String>：队列名称，相同任务队列名称相同
   * @start<Boolean>：是否立即开始执行
   * @again<Boolean>：队列执行结束后，是否再把任务添加到队列里，只有 start = false 时有效
   * @return<Function>：取消函数
   */
  add({ id, action, queueName = 'queue', start = true, again = false }) {
    const queue = this.getQueue(queueName);

    // 取消相同ID任务
    this.cancelTask(id, queueName);
    const taskWrapper = {
      id,
      action,
      isCancelled: false,
    };
    queue.tasks.push(taskWrapper);
    this.activeTasks.set(id, taskWrapper);
    if (start) {
      this.start(queueName);
    } else if (again) {
      queue.againTasks.push(taskWrapper);
    }
    return () => this.cancelTask(id, queueName);
  }

  /**
   * 取消任务
   * @id：任务ID
   */
  cancelTask(id, queueName) {
    if (this.activeTasks.has(id)) {
      const task = this.activeTasks.get(id);
      if (task) task.isCancelled = true;
      this.activeTasks.delete(id);
    }
    const queue = this.getQueue(queueName);
    queue.tasks = queue.tasks.filter((task) => task.id !== id);
    queue.againTasks = queue.againTasks.filter((task) => task.id !== id);
  }

  /**
   * 执行队列
   */
  start(queueName) {
    const queue = this.getQueue(queueName);

    // 如果队列为0，或者正在运行中，则返回
    if (queue.tasks.length === 0 || queue.isRunning) {
      return;
    }
    queue.isRunning = true;
    const nextTask = queue.tasks.shift();
    if (!nextTask || nextTask.isCancelled) {
      queue.isRunning = false;
      this.start(queueName);
      return;
    }
    try {
      const result = nextTask.action();
      if (result instanceof Promise) {
        result.finally(() => {
          this.activeTasks.delete(nextTask.id);
          queue.isRunning = false;
          if (queue.tasks.length > 0) {
            this.start(queueName);
          } else {
            // 处理again队列
            queue.tasks = [...queue.againTasks];
            // 这里执行 listen 的回调
            // eslint-disable-next-line no-unused-expressions
            this.callback.get(queueName)?.('end');
          }
        });
      } else {
        console.error(
          `任务未返回Promise: id=${nextTask.id}，queueName=${queueName}`,
        );
      }
    } catch (error) {
      console.error(`任务执行同步错误: id=${nextTask.id}`, error);
      queue.isRunning = false;
      this.start(queueName);
    }
  }
}

const globalScheduler = new GlobalScheduler();
export default globalScheduler;
