
import React from 'react';
import {TProduct} from './Product';

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
        newBasket = {...basket, 
          totalPrice: getTotalPrice(basket.products)
        };
      }
      else {
        basket.products.push({...product, count: 1});
        newBasket = {...basket, 
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
        newBasket = {...basket, 
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
        newBasket = {...basket, 
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

// корзины трей для шапки
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
      <div className='basket-item-list'>
        {
          basket.products.map(product => (
            <BasketItem 
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

// карточка продукта в корзине
export interface TBasketItemProps {
  product: TProduct,
  basketControl: TBasketControl
}

export function BasketItem(props: TBasketItemProps) {

  const product = props.product;

  return (
    <div className='basket-item'>
      <div className='basket-item__content'>
        <div className='basket-item__title'>
          <a href={`#!product?id=${product.id}`}>
            {product.title}
          </a>
        </div>
        <div className='basket-item__price'>
          Цена: {product.price} ₽
        </div>
        <div className='basket-item__producer'>
          Производитель: {product.producer}
        </div>
        <div className='basket-item__code'>
          Штрихкод: {product.code}
        </div>
      </div>
      <div className='basket-item__menu'>
        <BasketItemMenu 
          product={product}
          basketControl={props.basketControl} 
        />
      </div>
    </div>
  );
}

// корзинное меню продукта в корзине
export interface TBasketItemMenuProps {
  product: TProduct,
  basketControl: TBasketControl
}

export function BasketItemMenu(props: TBasketItemMenuProps) {

  const product = props.product;
  const [basket, basketDispatch] = props.basketControl;

  const count = basket.products
    .find(pr => pr.id === product.id)?.count ?? 0;

  function basketAdd() {
    basketDispatch({type: BasketActionType.ADD, args: product});
  }

  function basketSub() {
    basketDispatch({type: BasketActionType.SUB, args: product});
  }

  function basketDel() {
    basketDispatch({type: BasketActionType.DEL, args: product});
  }

  return (
    <div className='basket-item-menu'>
      <div className='basket-item-menu__info'>
        {`${count} шт на ${count*product.price} ₽`}
      </div>
      <div className='basket-item-menu__btns'>
        <button className='basket-item-menu__btn' onClick={basketAdd}>+</button>{' '}
        <button className='basket-item-menu__btn' onClick={basketSub}>–</button>{' '}
        <button className='basket-item-menu__btn' onClick={basketDel}>x</button>
      </div>
    </div>
  )
}

// корзинное меню продукта в каталоге
export interface TProductBasketMenuProps {
  product: TProduct,
  basketControl: TBasketControl
}

export function ProductBasketMenu(props: TProductBasketMenuProps) {

  const product = props.product;
  const [basket, basketDispatch] = props.basketControl;

  const count = basket.products
    .find(pr => pr.id === product.id)?.count ?? 0;

  function basketAdd() {
    basketDispatch({type: BasketActionType.ADD, args: product});
  }

  function basketSub() {
    basketDispatch({type: BasketActionType.SUB, args: product});
  }

  function basketDel() {
    basketDispatch({type: BasketActionType.DEL, args: product});
  }

  return (
    <div className='product-basket-menu'>
      <div className='product-basket-menu__info'>
        {`${count} шт на ${count*product.price} ₽`}
      </div>
      <button className='product-basket-menu__btn' onClick={basketAdd}>+</button>{' '}
      <button className='product-basket-menu__btn' onClick={basketSub}>–</button>{' '}
      <button className='product-basket-menu__btn' onClick={basketDel}>x</button>
    </div>
  )
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

