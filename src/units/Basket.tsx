
import React from 'react';
import {TProduct, ProductCard} from './Product';

export type TBasketProduct = TProduct & {count: number};

export interface TBasket {
  products: TBasketProduct[],
  totalCount: number,
  totalPrice: number,
}

export enum BasketActionType { 
  INIT,
  ADD, 
  SUB, 
  DEL,
}

export interface TBasketAction {
  type: BasketActionType,
  args?: any
}

export type TBasketControl = [
  TBasket,
  React.Dispatch<TBasketAction>
]

const defaultBasket: TBasket = {
  products: [],
  totalCount: 0,
  totalPrice: 0,
}

function basketReducer(basket: TBasket, action: TBasketAction) {
  
  switch (action.type) {

    case BasketActionType.INIT: {
      const newBasket = action.args as TBasket;
      localStorage.setItem('basket', JSON.stringify(newBasket));
      return newBasket;
    }
    
    case BasketActionType.ADD: {
      let newBasket: TBasket;
      const product = action.args as TProduct;
      const index = basket.products.findIndex(pr => pr.id === product.id);
      if (index >= 0) {
        basket.products[index].count++;
        newBasket = { ...basket, 
          totalPrice: getTotalPrice(basket.products)
        };
      }
      else {
        basket.products.push({...product, count: 1});
        newBasket = { ...basket, 
          totalCount: basket.products.length,
          totalPrice: getTotalPrice(basket.products)
        };
      }
      localStorage.setItem('basket', JSON.stringify(newBasket));
      return newBasket;
    }

    case BasketActionType.SUB: {
      let newBasket: TBasket;
      const product = action.args as TProduct;
      const index = basket.products.findIndex(pr => pr.id === product.id);
      if (index >= 0) {
        basket.products[index].count--;
        if (basket.products[index].count <= 0) {
          basket.products.splice(index, 1);
        }
        newBasket = { ...basket, 
          totalCount: basket.products.length,
          totalPrice: getTotalPrice(basket.products)
        };
      }
      else {
        newBasket = basket
      }
      localStorage.setItem('basket', JSON.stringify(newBasket));
      return newBasket;
    }

    case BasketActionType.DEL: {
      let newBasket: TBasket;
      const product = action.args as TProduct;
      const index = basket.products.findIndex(pr => pr.id === product.id);
      if (index >= 0) {
        basket.products.splice(index, 1);
        newBasket = { ...basket, 
          totalCount: basket.products.length,
          totalPrice: getTotalPrice(basket.products)
        };
      }
      else {
        newBasket = basket
      }
      localStorage.setItem('basket', JSON.stringify(newBasket));
      return newBasket;
    }

    default: 
      return basket;
  }

  function getTotalPrice(products: TBasketProduct[]) {
    return products.reduce((s, pr) => (s + pr.price*pr.count), 0);
  }
}

// контроль корзины
export function useBasketReducer() {
  return React.useReducer(basketReducer, defaultBasket);
}

// корзина трей
interface TBasketTrayProps {
  basketControl: TBasketControl
}

export function BasketTray(props: TBasketTrayProps) {

  const [basket, ] = props.basketControl;

  return (
    <div style={{color: 'blue'}}>
      <a href='#!basket'>
        В корзине товаров {basket.totalCount} на {basket.totalPrice} ₽
      </a>
    </div>
  );
}

// корзина
interface TBasketProps {
  basketControl: TBasketControl
}

export function Basket(props: TBasketProps) {

  const [basket, ] = props.basketControl;
  
  document.title = 'Корзина';
  
  return (
    <div className='basket'>
      <h1>Корзина</h1>
      <div className='basket-products-list'>
        {
          basket.products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              basketControl={props.basketControl} 
            />
          ))
        }
      </div>
    </div>
  );
}

// инициализация корзины
export async function initBasket(basketControl: TBasketControl) {
  const [ , basketDispatch] = basketControl;
  const basket = await fetchBasket();
  basketDispatch({type: BasketActionType.INIT, args: basket});
}

// получение корзины из хранилища
export async function fetchBasket() {
  console.log('call fetchBasket');
  return (JSON.parse(localStorage.getItem('basket') ?? 'null')) ?? defaultBasket;
}

