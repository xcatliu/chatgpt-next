import classNames from 'classnames';
import { isMobile } from 'is-mobile';
import { ChangeEvent, FC, FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { isDomChild } from '@/utils/isDomChildren';
// import { scrollToBottom } from '@/utils/scrollToBottom';

interface TextareaFormProps {
  placeholder?: string;
  onSubmit: (text: string) => Promise<void>;
}

export const TextareaForm: FC<TextareaFormProps> = ({ placeholder, onSubmit }) => {
  // 是否正在编辑
  const [composing, setComposing] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.addEventListener('touchstart', (e) => {
      const targetElement = e.target as HTMLElement;
      // 如果 textarea 当前不是 focus 状态，则跳过
      if (textareaRef.current !== document.activeElement) {
        return;
      }
      // 如果触碰的是 form 内，则跳过
      if (isDomChild(formRef.current, targetElement)) {
        return;
      }
      // 如果触碰的是 form 外，则 blur textarea
      textareaRef.current?.blur();
    });
  }, []);

  /** 聚焦时滚动到最底下，bug 比较多，先关闭 */
  // const onFocus = useCallback(() => {
  //   scrollToBottom();
  // }, []);
  /** 更新 submit 按钮的 disable 态 */
  const updateSubmitDisabled = useCallback(() => {
    const value = textareaRef.current?.value?.trim();
    if (value) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, []);
  /** 更新 textarea 的高度 */
  const updateTextareaHeight = useCallback(() => {
    const textareaElement = textareaRef.current;
    if (!textareaElement) {
      return;
    }
    // https://stackoverflow.com/a/24676492/2777142
    textareaElement.style.height = '5px';
    const newHeight = Math.min(textareaElement.scrollHeight, 260);
    textareaElement.style.height = `${newHeight}px`;
    if (placeholderRef.current) {
      placeholderRef.current.style.height = `${newHeight + 20}px`;
    }
  }, []);
  /** 输入内容触发 */
  const onChange = useCallback(() => {
    updateTextareaHeight();
    // 保持滚动到最底下，bug 太多，先关闭
    // scrollToBottom();
    updateSubmitDisabled();
  }, [updateTextareaHeight, updateSubmitDisabled]);
  /** 中文输入法控制 */
  const onCompositionStart = useCallback(() => setComposing(true), []);
  const onCompositionEnd = useCallback(() => {
    setComposing(false);
    // 由于 onChange 和 onCompositionEnd 的时序问题，这里也需要调用 updateSubmitDisabled
    updateSubmitDisabled();
  }, [updateSubmitDisabled]);
  /** 提交表单处理 */
  const formOnSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      const value = textareaRef.current?.value?.trim();
      if (!value) {
        return;
      }
      // 提交后清空内容
      if (textareaRef.current?.value) {
        textareaRef.current.value = '';
      }
      updateTextareaHeight();
      setSubmitDisabled(true);
      await onSubmit(value);
      setSubmitDisabled(false);
    },
    [onSubmit, updateTextareaHeight],
  );
  /** 修改回车默认行为 */
  const onKeyDone = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // 如果正在中文输入，则跳过 keyDone 事件
      if (composing) {
        return;
      }
      // [Ctrl/Cmd + Enter] 发送消息
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        formOnSubmit();
        return;
      }
      // PC 端，回车发送消息
      if (!isMobile() && e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        formOnSubmit();
        return;
      }
    },
    [composing, formOnSubmit],
  );

  return (
    <>
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="h-[3.75rem] mb-[env(safe-area-inset-bottom)]" ref={placeholderRef} />
      </div>
      <div className="w-inherit fixed bottom-0 z-10 bg-gray-100 md:px-[1.75rem] px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <form ref={formRef} className="flex space-x-3" onSubmit={formOnSubmit}>
          <textarea
            ref={textareaRef}
            className="flex-grow px-3 py-2 rounded resize-none"
            placeholder={placeholder}
            // onFocus={onFocus}
            onChange={onChange}
            onKeyDown={onKeyDone}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            rows={1}
          />
          <div className="flex items-center">
            <input
              className={classNames(' active:bg-gray-200 px-3 py-2 rounded h-full max-h-16 w-14', {
                'bg-white': !submitDisabled,
                'bg-gray-200': submitDisabled,
                'text-gray-400': submitDisabled,
              })}
              type="submit"
              disabled={submitDisabled}
              value="发送"
            />
          </div>
        </form>
      </div>
    </>
  );
};
