export function format(str: string, ...values: any[]): string {
  return str.replace(/\{(\d+)\}/g, function (match, index) {
    if (values.length > index) {
      return values[index];
    } else {
      return "";
    }
  });
}

/**
 *  Get the closest scrollable parent of a given node.
 * @param node
 * @returns
 */
export function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  if (node == null) {
    return null;
  }
  const regex = /(auto|scroll)/;
  const parents: Array<HTMLElement> = [];
  let parent = node;
  while (parent) {
    parents.push(parent);
    parent = parent.parentElement as HTMLElement;
  }
  for (let i = 0; i < parents.length; i++) {
    const style = getComputedStyle(parents[i]);
    if (regex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parents[i];
    }
    if (parents[i].tagName === "BODY") {
      return parents[i];
    }
  }
  return null;
}
