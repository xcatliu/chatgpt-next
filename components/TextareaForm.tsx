import classNames from 'classnames';
import { ChangeEvent, FC, FormEvent, KeyboardEvent, useCallback, useRef, useState } from 'react';

interface TextareaFormProps {
  placeholder?: string;
  onSubmit: (text: string) => Promise<void>;
}

export const TextareaForm: FC<TextareaFormProps> = ({ placeholder, onSubmit }) => {
  // 是否正在编辑
  const [composing, setComposing] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** 聚焦时滚动到最底下 */
  const onFocus = useCallback(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);
  /** 更新 submit 按钮的 disable 态 */
  const updateSubmitDisabled = useCallback(() => {
    const value = textareaRef.current?.value?.trim();
    if (value) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, []);
  /** 输入内容触发 */
  const onChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      // https://stackoverflow.com/a/24676492/2777142
      e.target.style.height = '5px';
      e.target.style.height = Math.min(e.target.scrollHeight, 260) + 'px';
      // 保持滚动到最底下
      window.scrollTo(0, document.body.scrollHeight);
      updateSubmitDisabled();
    },
    [updateSubmitDisabled],
  );
  /** 中文输入法控制 */
  const onCompositionStart = useCallback(() => setComposing(true), []);
  const onCompositionEnd = useCallback(() => {
    setComposing(false);
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
      if (textareaRef.current?.value) {
        textareaRef.current.value = '';
      }
      setSubmitDisabled(true);
      await onSubmit(value);
      setSubmitDisabled(false);
    },
    [onSubmit],
  );
  /** 修改回车默认行为 */
  const onKeyDone = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // 如果正在中文输入，则跳过 keyDone 事件
      if (composing) {
        return;
      }
      // 单独按回车时，提交表单
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        formOnSubmit();
        return;
      }
    },
    [composing, formOnSubmit],
  );

  return (
    <form className="flex space-x-3" onSubmit={formOnSubmit}>
      <textarea
        ref={textareaRef}
        className="flex-grow px-3 py-2 rounded resize-none"
        placeholder={placeholder}
        onFocus={onFocus}
        onChange={onChange}
        onKeyDown={onKeyDone}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        rows={1}
      />
      <div className="flex items-center">
        <input
          className={classNames('bg-white active:bg-gray-200 px-3 py-2 rounded h-full max-h-16 w-14', {
            'bg-gray-200': submitDisabled,
            'text-gray-500': submitDisabled,
          })}
          type="submit"
          disabled={submitDisabled}
          value="发送"
        />
      </div>
    </form>
  );
};
