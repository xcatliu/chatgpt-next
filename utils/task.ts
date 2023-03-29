import { v4 as uuid } from 'uuid';

/**
 * task 缓存
 */
const taskMap = new Map<string, Task>();

/**
 * 创建一个 Task 实例
 */
export function createTask(callback: (...args: any[]) => any) {
  const task = new Task(callback);
  taskMap.set(task.id, task);

  return task;
}

/**
 * 根据 id 获取 Task 实例
 */
export function getTask(id: string) {
  return taskMap.get(id);
}

/**
 * 任务类
 */
export class Task {
  /**
   * 任务的唯一 id
   */
  public id: string;

  /**
   * 实例化任务
   */
  constructor(public callback: (...args: any[]) => any) {
    this.id = uuid();
  }

  /**
   * 执行此任务
   */
  public run(...args: any[]) {
    const runResult = this.callback(...args);

    // 执行完成后，销毁此任务，避免重复请求
    taskMap.delete(this.id);

    return runResult;
  }
}
