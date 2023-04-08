
import React from 'react'

// StateControl
export type TStateControl<T> = [
  T, 
  React.Dispatch<React.SetStateAction<T>>
];

export type TStateControl0<T> = [
  T, 
  React.Dispatch<React.SetStateAction<T>> | undefined
];

// useContextStateControl
export function useContextStateControl<T>(
  context: React.Context<TStateControl0<T>>
) {
  const [state, setState] = React.useContext(context);
  return [ 
    state, 
    (function (p: T) {if (setState) setState(p)})
  ] as TStateControl<T>;
}
