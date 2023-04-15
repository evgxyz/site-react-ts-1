
export function isIntStr(str: string) {
  return /^\d+$/.test(str);
}

export function range(from: number, to: number, step: number = 1) {
  const arr = [];
  for (let i = from; i <= to; i += step) {
    arr.push(i);
  }
  return arr;
}

export function compare<T>(x: T, y: T) {
  if (x === y) return 0;
  return (x < y) ? -1 : 1;
}

export function pickobj<T extends {}, K extends keyof T>(obj: T, keys: K[]) {
  return Object.fromEntries(
    keys
    .filter(key => key in obj)
    .map(key => [key, obj[key]])
  )
}

export function mergeobj<T extends {}, T2 extends {}>(obj: T, obj2: T2) {
  return Object.assign({}, obj, obj2) as (T & T2);
}

export function addobj<T extends {}, T2 extends {}>(obj: T, obj2: T2) {
  return Object.assign(obj, obj2) as (T & T2);
} 

