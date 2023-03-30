
import React, {useState} from 'react'

export function mergeObjects<T extends object, T2 extends object>(obj: T, addObj: T2) {
  return Object.assign(obj, addObj) as T;
}

export function isIntStr(str: string) {
  return /^\d+$/.test(str);
}

// хук для обновления объекта со слиянием
export function useStateMerge<T>(initValue: T) {
  const [value, setValue] = useState(initValue);
  const setValueMerge = function(value: T): void {
    setValue(prevValue => ({...prevValue, ...value}));
  }
  return [value, setValueMerge] as [T, (v: T) => void];
}