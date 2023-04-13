/**
 * 将 ReadableStream 转为字符串
 */
export async function stream2string(stream: ReadableStream | undefined | null, onMessage?: (content: string) => void) {
  if (!stream) {
    return '';
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const trunk = decoder.decode(value, { stream: true });
    onMessage?.(trunk);
    result += trunk;
  }
  reader.releaseLock();
  return result;
}
