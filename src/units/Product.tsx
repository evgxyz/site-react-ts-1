
import React from 'react';
import {TBasketControl, BasketActionTypes} from './Basket'

export interface TProduct {
  id: number | string,
  title: string,
  description?: string,
  price: number,
}

export interface TProductCardProps {
  basketControl: TBasketControl
}

export function ProductCard(props: TProductCardProps) {

  const handlerIncrement = function() {
    props.basketControl.dispatch({type: BasketActionTypes.inc});
  }

  const handlerDecrement = function() {
    props.basketControl.dispatch({type: BasketActionTypes.dec});
  }

  return (
    <div>
      <div>{props.basketControl.state.count}</div>
      <button onClick={handlerIncrement}>Добавить</button>
      <button onClick={handlerDecrement}>Убавить</button>
    </div>
  );
}
