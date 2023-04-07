/** 判断 child 是不是 ancestor 的子节点 */
export function isDomChildren(ancestor: HTMLElement | null, target: HTMLElement | null) {
  if (!ancestor || !target) {
    return false;
  }

  let parent: HTMLElement | null = target;
  do {
    parent = parent.parentElement;
    if (parent === ancestor) {
      return true;
    }
  } while (parent !== null);

  return false;
}
