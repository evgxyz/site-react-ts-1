
import React from 'react'

export type TContextStateControl<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>> | undefined
];

export function useContextStateControl<T>(
  context: React.Context<[T, React.Dispatch<React.SetStateAction<T>> | undefined]>
) {
  const [state, setState] = React.useContext(context);
  return [ 
    state, 
    (function (p: T) {if (setState) setState(p)})
  ] as [T, React.Dispatch<React.SetStateAction<T>>];
}
