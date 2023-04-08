
export function isIntStr(str: string) {
  return /^\d+$/.test(str);
}

export function mergeObj<T extends object, T2 extends object>(obj: T, addObj: T2) {
  return Object.assign({}, obj, addObj) as (T & T2);
}

export function addObj<T extends object, T2 extends object>(obj: T, addObj: T2) {
  return Object.assign(obj, addObj) as (T & T2);
} 

export function range(from: number, to: number, step: number = 1) {
  const arr = [];
  for (let i = from; i <= to; i += step) {
    arr.push(i);
  }
  return arr;
}
