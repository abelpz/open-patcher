export function getType<T>(x: T) {
  const t = typeof x;
  if (t === 'object' && Array.isArray(x)) return 'array';
  return typeof x;
}

export function getObjectCopy<T>(x: T): T {
  if (typeof x !== 'object' || x === null) {
    throw `Can't copy non-object type, copying value of type ${getType(x)}`;
  }
  if (Array.isArray(x)) {
    return Object.assign([], x);
  } else {
    return Object.assign({}, x);
  }
}

function splitLastElement<T>(array: T[]): [T[], T] {
  if (array.length === 0) {
    throw new Error('Array is empty');
  }
  const lastElement = array[array.length - 1];
  const restOfArray = array.slice(0, array.length - 1);
  return [restOfArray, lastElement];
}
function trimSlashes(path: string): string {
  return path.replace(/^\/+|\/+$/g, '');
}
export function splitPath<T>(path: string | T[]): [T[], T] {
  const pathArray =
    typeof path === 'string' ? (trimSlashes(path).split('/') as T[]) : path;
  if (pathArray.length === 0) {
    throw new Error('Path is empty');
  }
  return splitLastElement(pathArray);
}

export function areObjectsRelated<T extends Record<string, any>>(
  source: T,
  target: T,
): boolean {
  if (source === target && source !== null) {
    return true;
  }
  for (const key in source) {
    if (typeof source[key] === 'object' && typeof target[key] === 'object') {
      if (areObjectsRelated(source[key], target[key])) {
        return true;
      }
    }
  }
  return false;
}
