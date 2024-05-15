'use client';

import omit from 'lodash.omit';
import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchApiChat } from '@/utils/api';
import { getCache, setCache } from '@/utils/cache';
import type { ChatResponse, Message, StructuredMessageContentItem } from '@/utils/constants';
import { MAX_GPT_VISION_IMAGES, MAX_TOKENS, MessageContentType, Model, Role } from '@/utils/constants';
import type { ResError } from '@/utils/error';
import type { ImageProp } from '@/utils/image';
import { isMessage } from '@/utils/message';
import { gapToBottom, getIsScrolling, scrollToBottom } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

import { MenuContext, MenuKey } from './MenuContext';
import type { SettingsState } from './SettingsContext';
import { SettingsContext } from './SettingsContext';

/**
 * 聊天记录
 */
export interface HistoryItem {
  model: Model;
  messages: (Message | ChatResponse)[];
}

/**
 * 对话相关的 Context
 */
export const ChatContext = createContext<{
  sendMessage: (content?: string) => Promise<void>;
  abortSendMessage: () => void;
  isLoading: boolean;
  messages: (Message | ChatResponse)[];
  images: ImageProp[];
  appendImages: (...images: ImageProp[]) => void;
  deleteImage: (index: number) => void;
  history: HistoryItem[] | undefined;
  historyIndex: 'empty' | 'current' | number;
  loadHistory: (historyIndex: number) => void;
  deleteHistory: (historyIndex: 'current' | number) => void;
  startNewChat: () => void;
} | null>(null);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { setIsMenuShow, setCurrentMenu } = useContext(MenuContext)!;
  const { settings, setSettings } = useContext(SettingsContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<(Message | ChatResponse)[]>([]);
  const [images, setImages] = useState<ImageProp[]>([]);
  const [history, setHistory] = useState<HistoryItem[] | undefined>(undefined);
  // 当前选中的对话在 history 中的 index，empty 表示未选中，current 表示选中的是当前对话
  const [historyIndex, setHistoryIndex] = useState<'empty' | 'current' | number>('empty');
  // 控制请求中断
  const [abortController, setAbortController] = useState<AbortController>();

  // 页面加载后从 cache 中读取 history 和 messages
  // 如果 messages 不为空，则将最近的一条消息写入 history
  useEffect(() => {
    let history = getCache<HistoryItem[]>('history');
    let messages = getCache<(Message | ChatResponse)[]>('messages');
    let settings = getCache<SettingsState>('settings');
    // 如果检测到缓存中有上次还未存储到 cache 的 message，则加入到 history 中
    if (messages && messages.length > 0) {
      history = [{ model: settings?.model ?? Model['gpt-3.5-turbo'], messages }, ...(history ?? [])];
      setHistory(history);
      setCache('history', history);
      setMessages([]);
      setCache('messages', []);
    }

    // 根据 history 是否存在决定当前 menu tab 是什么
    if (history === undefined) {
      // 如果不存在 history，则当前 menu 是参数配置 tab
      setHistory([]);
      setCurrentMenu(MenuKey.AdjustmentsHorizontal);
    } else {
      // 如果存在 history，则当前 menu 是聊天记录 tab
      setHistory(history);
      setCurrentMenu(MenuKey.InboxStack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (content?: string) => {
      // 如果是空消息
      if ((content === undefined || content.length === 0) && images.length === 0) {
        return;
      }

      // 先获取旧的 messages 的备份
      let newMessages = [...messages];
      // 如果当前是在浏览聊天记录，则激活历史消息
      if (typeof historyIndex === 'number') {
        const newHistory = [...(history ?? [])];
        newMessages = [...newHistory.splice(historyIndex, 1)[0].messages];
        setHistory(newHistory);
        setCache('history', newHistory);
        setMessages(newMessages);
        setCache('messages', newMessages);
      }

      let newMessage: Message;
      // 没图片时，插入单条文字消息
      if (images.length === 0) {
        newMessage = {
          role: Role.user,
          content: content as string,
        };
      }
      // 有图片时则插入混合消息
      else {
        newMessage = {
          role: Role.user,
          content: images.map((image) => ({
            type: MessageContentType.image_url,
            image_url: {
              url: image.src,
              width: image.width,
              height: image.height,
            },
          })),
        };
        // 如果有文字，则在最前面插入文字消息
        if (content) {
          newMessage.content = [
            {
              type: MessageContentType.text,
              text: content,
            },
            ...(newMessage.content as StructuredMessageContentItem[]),
          ];
        }
      }

      // 先插入一条用户消息
      newMessages = [...newMessages, newMessage];
      setMessages(newMessages);
      setCache('messages', newMessages);
      // 清空已上传的图片
      setImages([]);
      setIsLoading(true);
      setHistoryIndex('current');
      await sleep(16);
      scrollToBottom();

      try {
        // stream 模式下，由前端组装消息
        let partialContent = '';
        const fetchApiChatMessages = newMessages
          // 过滤掉 isError 的消息
          .filter((message) => !(message as Message).isError)
          .slice(-(settings.maxHistoryLength + 1))
          .map((message) => {
            return isMessage(message) ? message : message.choices[0].message;
          });
        // 如果有前置消息，则写入到最前面
        if (settings.prefixMessages && settings.prefixMessages.length > 0) {
          fetchApiChatMessages.unshift(...settings.prefixMessages);
        }
        // 如果有系统消息，则写入到最前面
        if (settings.systemMessage) {
          fetchApiChatMessages.unshift(settings.systemMessage);
        }
        // 创建一个新的 abortController
        const newAbortController = new AbortController();
        setAbortController(newAbortController);
        // TODO 收到完整消息后，写入 cache 中
        const fullContent = await fetchApiChat({
          // gpt-4-vision-preview 有个 bug：不传 max_tokens 时，会中断消息
          ...(settings.model === Model['gpt-4-vision-preview'] && settings.max_tokens === undefined
            ? { max_tokens: MAX_TOKENS['gpt-4-vision-preview'] }
            : undefined),
          ...omit(settings, 'newChatModel', 'maxHistoryLength', 'systemMessage', 'prefixMessages', 'availableModels'),
          messages: fetchApiChatMessages,
          stream: true,
          onMessage: (content) => {
            // stream 模式下，由前端组装消息
            partialContent += content;
            setIsLoading(false);
            setMessages([...newMessages, { role: Role.assistant, content: partialContent }]);
            // 如果当前滚动位置距离最底端少于等于 72（即 3 行）并且当前用户没有正在滚动，则保持滚动到最底端
            if (gapToBottom() <= 72 && !getIsScrolling()) {
              scrollToBottom();
            }
          },
          signal: newAbortController.signal,
        });

        // 收到完整消息后，重新设置 messages
        newMessages = [...newMessages, { role: Role.assistant, content: fullContent }];
        setMessages(newMessages);
        setCache('messages', newMessages);
        // 如果当前滚动位置距离最底端少于等于 72（即 3 行）并且当前用户没有正在滚动，则保持滚动到最底端
        if (gapToBottom() <= 72 && !getIsScrolling()) {
          scrollToBottom();
        }
      } catch (e: any) {
        // 如果是调用 abortController.abort() 捕获到的 error 则不处理
        if (e.name === 'AbortError') {
          return;
        }
        // 发生错误时，展示错误消息
        setIsLoading(false);
        setMessages([
          ...newMessages,
          { isError: true, role: Role.assistant, content: (e as ResError).message || (e as ResError).code.toString() },
        ]);
      }
    },
    [settings, messages, images, history, historyIndex, setAbortController],
  );

  /**
   * 中断请求
   */
  const abortSendMessage = useCallback(() => {
    abortController?.abort();
  }, [abortController]);

  /**
   * 加载聊天记录
   */
  const loadHistory = useCallback(
    async (index: number) => {
      if (historyIndex === index) {
        return;
      }

      const newModel = history?.[index].model ?? Model['gpt-3.5-turbo'];

      if (historyIndex === 'empty') {
        setHistoryIndex(index);
        setSettings({
          model: newModel,
        });
        setIsMenuShow(false);
        await sleep(16);
        scrollToBottom();
        return;
      }

      // 如果当前是在浏览历史，则直接切换 historyIndex
      if (typeof historyIndex === 'number') {
        setHistoryIndex(index);
        setSettings({
          model: newModel,
        });
        setIsMenuShow(false);
        await sleep(16);
        scrollToBottom();
        return;
      }

      // 如果当前有正在进行的聊天，则将正在进行的聊天归档到 history 中
      if (historyIndex === 'current') {
        const newHistory = [{ model: settings.model, messages }, ...(history ?? [])];
        setHistory(newHistory);
        setCache('history', newHistory);
        setMessages([]);
        setCache('messages', []);
        // 此时因为将 current 进行归档了，所以需要 +1
        setHistoryIndex(index + 1);
        setSettings({
          model: newModel,
        });
        setIsMenuShow(false);
        await sleep(16);
        scrollToBottom();
      }
    },
    [setIsMenuShow, historyIndex, messages, history, settings.model, setSettings],
  );

  /** 删除单条聊天记录 */
  const deleteHistory = useCallback(
    async (deleteIndex: 'current' | number) => {
      // 如果删除的是还没有写入 history 的当前聊天，则直接删除 messages
      if (deleteIndex === 'current') {
        setMessages([]);
        setCache('messages', []);
        const newIndex = history && history.length > 0 ? 0 : 'empty';
        setHistoryIndex(newIndex);
        if (typeof newIndex === 'number') {
          const newModel = history?.[newIndex].model ?? Model['gpt-3.5-turbo'];
          setSettings({
            model: newModel,
          });
        }
        return;
      }

      const newHistory = history?.filter((_, index) => index !== deleteIndex) ?? [];

      setHistory(newHistory);
      setCache('history', newHistory);

      // 如果删除的是当前显示的 history，则选择最近的一条聊天记录展示
      if (deleteIndex === historyIndex) {
        // 选择最近的一条聊天记录展示
        const newIndex = newHistory && newHistory.length > 0 ? Math.min(deleteIndex, newHistory.length - 1) : 'empty';
        setHistoryIndex(newIndex);
        if (typeof newIndex === 'number') {
          const newModel = newHistory[newIndex].model ?? Model['gpt-3.5-turbo'];
          setSettings({
            model: newModel,
          });
        }
      }
    },
    [history, historyIndex, setSettings],
  );

  /** 开启新对话 */
  const startNewChat = useCallback(() => {
    let newHistory = [...(history ?? [])];
    if (messages.length > 0) {
      newHistory = [{ model: settings.model, messages }, ...newHistory];
    }
    setHistory(newHistory);
    setCache('history', newHistory);
    setMessages([]);
    setCache('messages', []);
    setHistoryIndex('empty');
    setSettings({
      model: settings.newChatModel,
    });
  }, [messages, history, settings.model, settings.newChatModel, setSettings]);

  const appendImages = useCallback(
    (...newImages: ImageProp[]) => {
      const finalImages = [...images, ...newImages];
      if (finalImages.length > MAX_GPT_VISION_IMAGES) {
        setImages(finalImages.slice(0, MAX_GPT_VISION_IMAGES));
        alert(`最多只能发送 ${MAX_GPT_VISION_IMAGES} 张图片，超出的图片已删除`);
        return;
      }
      setImages(finalImages);
    },
    [images],
  );

  const deleteImage = useCallback(
    (index: number) => {
      const finalImages = [...images];
      finalImages.splice(index, 1);
      setImages(finalImages);
    },
    [images],
  );

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        abortSendMessage,
        isLoading,
        messages,
        images,
        appendImages,
        deleteImage,
        history,
        historyIndex,
        loadHistory,
        deleteHistory,
        startNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
