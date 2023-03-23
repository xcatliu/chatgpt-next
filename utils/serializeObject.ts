/**
 * ChatGPT 写的代码，序列化一个对象，按照字母排序，保证相同对象的到同样的值
 */
export function serializeObject(obj?: Record<string, any>) {
  if (obj === undefined) {
    return '';
  }

  // 过滤 undefined 和 null 的属性
  const filteredObj = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => value !== undefined && value !== null),
  );

  // 对剩余的属性按字母顺序进行排序
  const sortedKeys = Object.keys(filteredObj).sort();

  // 序列化对象并返回
  return JSON.stringify(Object.fromEntries(sortedKeys.map((key) => [key, filteredObj[key]])));
}
