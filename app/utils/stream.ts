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
    onMessage?.(value);
    result += decoder.decode(value, { stream: true });
  }
  reader.releaseLock();
  return result;
}
