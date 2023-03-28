
import React, {useState} from 'react'

// хук для обновления объекта со слиянием
export function useStateMerge<T>(initValue: T) {
  const [value, setValue] = useState(initValue);
  const setValueMerge = function(value: T): void {
    setValue(prevValue => ({...prevValue, ...value}));
  }
  return [value, setValueMerge] as [T, (v: T) => void];
}