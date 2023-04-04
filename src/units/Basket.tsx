
import React, {useState, useEffect, useReducer} from 'react';
import {TProduct, TProducer, TCategory, ProductCard} from './Products';

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

export type TBasketDispatch = React.Dispatch<TBasketAction>

export interface TBasketControl {
  state: TBasket,
  dispatch: TBasketDispatch
}

const defaultBasket: TBasket = {
  products: [],
  totalCount: 0,
  totalPrice: 0,
}

function basketReducer(state: TBasket, action: TBasketAction) {
  switch (action.type) {

    case BasketActionType.INIT: {
      const newState = action.args as TBasket;
      localStorage.setItem('basket', JSON.stringify(newState));
      return newState;
    }
    
    case BasketActionType.ADD: {
      let newState: TBasket;
      const product = action.args as TProduct;
      const index = state.products.findIndex(pr => pr.id === product.id);
      if (index >= 0) {
        state.products[index].count++;
        const totalPrice = state.products.reduce((s, pr) => (s + pr.price*pr.count), 0);
        newState = { ...state, 
          totalPrice: totalPrice
        };
      }
      else {
        state.products.push({...product, count: 1});
        const totalPrice = state.products.reduce((s, pr) => (s + pr.price*pr.count), 0);
        newState = { ...state, 
          totalCount: state.products.length,
          totalPrice: totalPrice
        };
      }
      localStorage.setItem('basket', JSON.stringify(newState));
      return newState;
    }

    case BasketActionType.SUB: {
      let newState: TBasket;
      const product = action.args as TProduct;
      const index = state.products.findIndex(pr => pr.id === product.id);
      if (index >= 0) {
        state.products[index].count--;
        if (state.products[index].count <= 0) {
          state.products.splice(index, 1);
        }
        const totalPrice = state.products.reduce((s, pr) => (s + pr.price*pr.count), 0);
        newState = { ...state, 
          totalCount: state.products.length,
          totalPrice: totalPrice
        };
      }
      else {
        newState = state
      }
      localStorage.setItem('basket', JSON.stringify(newState));
      return newState;
    }

    case BasketActionType.DEL: {
      let newState: TBasket;
      const product = action.args as TProduct;
      const index = state.products.findIndex(pr => pr.id === product.id);
      if (index >= 0) {
        state.products.splice(index, 1);
        const totalPrice = state.products.reduce((s, pr) => (s + pr.price*pr.count), 0);
        newState = { ...state, 
          totalCount: state.products.length,
          totalPrice: totalPrice
        };
      }
      else {
        newState = state
      }
      localStorage.setItem('basket', JSON.stringify(newState));
      return newState;
    }

    default: 
      return state;
  }
}

export function useBasketControl(): TBasketControl {
  const [state, dispatch] = useReducer(basketReducer, defaultBasket);
  return {state, dispatch};
}

// корзина трей
interface TBasketTrayProps {
  basketControl: TBasketControl
}

export function BasketTray(props: TBasketTrayProps) {
  return (
    <div style={{color: 'blue'}}>
      <a href='#!basket'>
      В корзине товаров {props.basketControl.state.totalCount} {' '}
      на {props.basketControl.state.totalPrice} ₽
      </a>
    </div>
  );
}

// корзина
interface TBasketProps {
  basketControl: TBasketControl
}

export function Basket(props: TBasketProps) {
  document.title = 'Корзина';
  return (
    <div className='basket'>
      <h1>Корзина</h1>
      <div className='basket-products-list'>
        {
          props.basketControl.state.products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              basketControl={props.basketControl} 
            />
          )
        )
        }
      </div>
    </div>
  );
}

// карточка продукта 
/* interface TBasketProductCardProps {
  product: TProduct,
  basketControl: TBasketControl
}

function BasketProductCard(props: TBasketProductCardProps) {

  const count = props.basketControl.state.products
    .find(pr => pr.id === props.product.id)?.count ?? 0;

  const handlerAdd = function() {
    props.basketControl.dispatch({type: BasketActionType.ADD, args: props.product});
  }

  const handlerSub = function() {
    props.basketControl.dispatch({type: BasketActionType.SUB, args: props.product});
  }

  const handlerDel = function() {
    props.basketControl.dispatch({type: BasketActionType.DEL, args: props.product});
  }

  return (
    <div className='product-card'>
      <div className='product-card__content'>
        <div className='product-card__title'>
          {props.product.title}
        </div>
        <div className='product-card__description'>
          {props.product.description}
        </div>
        <div className='product-card__price'>
          Цена: {props.product.price} ₽
        </div>
        <div className='product-card__categories'>
          {'Категории: '}
          {
            props.product.categories.map((ct, i) => (
              <>
              {i > 0 ? ', ' : ''}
              <span key={ct} className='product-card__category'>{ct}</span>
              </>
            ))
          }
        </div>
        <div className='product-card__producer'>
          Производитель: {props.product.producer}
        </div>
        <div className='product-card__code'>
          Штрихкод: {props.product.code}
        </div>
      </div>
      <div className='product-card__menu'>
        <div className='product-card__menu-info'>
          {`В корзине ${count} шт на ${count*props.product.price} ₽`}
        </div>
        <button className='product-card__btn' onClick={handlerAdd}>+</button>{' '}
        <button className='product-card__btn' onClick={handlerSub}>–</button>
        <button className='product-card__btn' onClick={handlerDel}>X</button>
      </div>
    </div>
  );
} */

// инициализация 
export async function initBasket(basketControl: TBasketControl) {
  const basket = await fetchBasket();
  basketControl.dispatch({type: BasketActionType.INIT, args: basket});
}

// получение корзины из хранилища
export async function fetchBasket() {
  console.log('call fetchBasket');
  return (JSON.parse(localStorage.getItem('basket') ?? 'null')) ?? defaultBasket;
}

