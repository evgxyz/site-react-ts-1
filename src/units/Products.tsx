
import React from 'react';
import {TBasketControl, BasketActionTypes} from './Basket'

export interface TProduct {
  id: number,
  title: string,
  price: number,
  description: string,
  producer: string,
  categories: string[],
}

export interface TProducer {
  id: number,
  title: string,
}

export interface TCategory {
  id: number,
  title: string,
  rate: number,
}

// карточка продукта 
export interface TProductCardProps {
  product: TProduct,
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
      <div>
        <pre>{JSON.stringify(props.product)}</pre>
      </div>
      <button onClick={handlerIncrement}>Добавить</button>
      <button onClick={handlerDecrement}>Убавить</button>
    </div>
  );
}
