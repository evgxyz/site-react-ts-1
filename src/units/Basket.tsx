
import React, {useState, useEffect, useReducer} from 'react';

export interface TBasketState {
  count: number
}

export enum BasketActionTypes { inc, dec }

export interface TBasketAction {
  type: BasketActionTypes,
  args?: any
}

export type TBasketDispatch = React.Dispatch<TBasketAction>

export interface TBasketControl {
  state: TBasketState,
  dispatch: TBasketDispatch
}

function basketReducer(state: TBasketState, action: TBasketAction) {
  switch (action.type) {
    case BasketActionTypes.inc: 
      return { ...state, count: state.count + 1 }
    case BasketActionTypes.dec: 
      return { ...state, count: state.count - 1 }
    default: 
      return state;
  }
}

const BasketInitState: TBasketState = {
  count: 0
}

export function useBasketControl(): TBasketControl {
  const [state, dispatch] = useReducer(basketReducer, BasketInitState);
  return {state, dispatch};
}

interface TBasketTrayProps {
  basketControl: TBasketControl
}

export function BasketTray(props: TBasketTrayProps) {

  const [value, setValue] = useState(false);

  useEffect(() => { setValue(prevValue => !prevValue) }, [props.basketControl.state.count] )

  return (
    <div style={{color: value ? 'red' : 'green'}}>
      В корзине {props.basketControl.state.count} товаров
    </div>
  );
}
