import type { ChatMessage } from 'chatgpt';
import { v4 as uuid } from 'uuid';

/**
 * sse task 缓存
 */
const sseTaskMap = new Map<string, SseTask>();

/**
 * 创建一个 SseTask 实例
 */
export function createSseTask() {
  const id = uuid();

  const sseTask = new SseTask(id);
  sseTaskMap.set(id, sseTask);

  return sseTask;
}

/**
 * 根据 id 获取 SseTask 实例
 */
export function getSseTask(id: string) {
  return sseTaskMap.get(id);
}

/**
 * Server Sent Event Task
 * 用于管理一个 sse 的生命周期
 */
class SseTask {
  /** ChatGPT 回答的部分文字内容 */
  private partialText = '';
  private waitForAppendText: Promise<any>;
  private appendTextResolve: (value: any) => void = () => {};

  /** chatMessage 是最后一条消息，包含所有的数据 */
  public chatMessage?: ChatMessage;

  constructor(public id: string) {
    // 重置 waitForAppendText 和 appendTextResolve
    this.waitForAppendText = new Promise((resolve) => {
      this.appendTextResolve = resolve;
    });
  }

  /** appendText 供消息提供方调用 */
  public appendText(text: string) {
    this.partialText += text;
    this.appendTextResolve(true);
  }

  /** setChatMessage 供消息提供方调用，表示消息已完结，设置一次全消息 */
  public setChatMessage(chatMessage: ChatMessage) {
    this.chatMessage = chatMessage;
  }

  /**
   * 使用 generator 流式获取 appendText 添加的内容
   * for await (const partialText of sseTask.streamTextGenerator()) {
   *   console.log(partialText);
   * }
   *
   * console.log(sseTask.chatMessage);
   */
  public async *streamTextGenerator() {
    // 如果一开始就有 chatMessage，则表示流式请求已结束了
    if (this.chatMessage) {
      yield this.partialText;
      return;
    }

    // 一直循环直到 chatMessage 存在，表示流式请求结束
    while (!this.chatMessage) {
      // 先等待 appendText 被调用
      await this.waitForAppendText;
      // appendText 被调用后，输出之前积攒的 partialText
      yield this.partialText;
      // 再清空 partialText
      this.clearPartialText();
    }
  }

  /**
   * 清空 partialText
   */
  private clearPartialText() {
    this.partialText = '';

    // 重置 waitForAppendText 和 appendTextResolve
    this.waitForAppendText = new Promise((resolve) => {
      this.appendTextResolve = resolve;
    });
  }
}
