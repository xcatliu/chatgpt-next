/** 判断 child 是不是 ancestor 的子节点 */
export function isDomChild(ancestor: HTMLElement | null, child: HTMLElement | null) {
  if (!ancestor || !child) {
    return false;
  }

  let parent: HTMLElement | null = child;
  do {
    parent = parent.parentElement;
    if (parent === ancestor) {
      return true;
    }
  } while (parent !== null);

  return false;
}
