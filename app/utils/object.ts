export function isObject(value: any) {
  if (typeof value === 'object' && value !== null) {
    return true;
  }
  return false;
}

/**
 * 递归的去除对象中的所有 undefined、null 和空对象
 * TODO 没有处理循环引用
 */
export function cleanObject(value: any) {
  // 如果是一个普通值，则直接返回该值
  if (!Array.isArray(value) && !isObject(value)) {
    return value;
  }
  // 如果是一个数组
  if (Array.isArray(value)) {
    const newArray: any[] = [];
    // 针对数组的每一项，递归的执行 cleanObject
    value.forEach((item) => {
      const newItem = cleanObject(item);
      // 如果 cleanObject 的结果是空，则放弃该项
      if (newItem === undefined || newItem === null) {
        return;
      }
      // 如果 cleanObject 的结果不为空，则加入到 newArray 中
      newArray.push(newItem);
    });
    // 检查 newArray 是否为空数组，如果是空数组，则直接返回空
    if (newArray.length === 0) {
      return null;
    }
    // 如果不是空数组，则返回 newArray
    return newArray;
  }
  // 如果是一个对象
  const newObject: Record<string, any> = {};
  Object.keys(value).forEach((key) => {
    const newValue = cleanObject(value[key]);
    // 如果 cleanObject 的结果是空，则放弃该项
    if (newValue === undefined || newValue === null) {
      return;
    }
    // 如果 cleanObject 的结果不为空，则加入到 newObject 中
    newObject[key] = newValue;
  });
  // 检查 newObject 是否为空对象，如果是空对象，则直接返回空
  if (Object.keys(newObject).length === 0) {
    return null;
  }
  // 如果不是空对象，则返回 newObject
  return newObject;
}

/**
 * 将 object 重新生成，递归的按照字母排序 key
 * TODO 没有处理循环引用
 */
export function sortObjectKeys(value: any): any {
  // 如果是一个普通值，则直接返回该值
  if (!Array.isArray(value) && !isObject(value)) {
    return value;
  }
  // 如果是一个数组，不要调换其顺序，但需要递归的调用 sortObjectKeys
  if (Array.isArray(value)) {
    return value.map((item) => sortObjectKeys(item));
  }
  // 如果是一个对象，递归的按照字母排序 key
  const sortedKeys = Object.keys(value).sort();
  return Object.fromEntries(sortedKeys.map((key) => [key, sortObjectKeys(value[key])]));
}

/**
 * 序列化一个对象，去除空值，按照字母排序 key，保证相同对象得到相同的字符串
 */
export function serializeObject(obj: any) {
  // 去除空值
  const cleanedObject = cleanObject(obj);

  // 如果为空，则返回空字符串
  if (cleanedObject === undefined || cleanedObject === null) {
    return '';
  }

  // 对去除了空值的对象进行 key 排序
  const sortedObject = sortObjectKeys(cleanedObject);

  // 序列化对象并返回
  return JSON.stringify(sortedObject);
}
