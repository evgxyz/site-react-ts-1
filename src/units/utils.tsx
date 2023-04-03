

export function isIntStr(str: string) {
  return /^\d+$/.test(str);
}

export function mergeObj<T extends object, T2 extends object>(obj: T, addObj: T2) {
  return Object.assign({}, obj, addObj) as (T & T2);
}

export function addObj<T extends object, T2 extends object>(obj: T, addObj: T2) {
  return Object.assign(obj, addObj) as (T & T2);
} 
