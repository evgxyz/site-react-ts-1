
import React from 'react';
import {useEnvControl} from './Env';
import {TProduct} from './Products';

export type TBasketProduct = TProduct & {count: number};

export interface TBasket {
  products: TBasketProduct[],
  totalCount: number,
  totalPrice: number,
}

export enum BasketActionType { 
  INIT,
  CLEAN,
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

    case BasketActionType.CLEAN: {
      localStorage.setItem('basket', JSON.stringify(defaultBasket));
      return defaultBasket;
    }

    default: 
      return basket;
  }

  function getTotalPrice(products: TBasketProduct[]) {
    return products.reduce((s, pr) => (s + pr.price * pr.count), 0);
  }
}

// контроль корзины
export function useBasketReducer() {
  return React.useReducer(basketReducer, defaultBasket);
}

// корзина
interface TBasketProps {
  basketControl: TBasketControl
}

export function Basket(props: TBasketProps) {

  const [ , setEnv] = useEnvControl();
  const [basket, basketDispatch] = props.basketControl;
  const [busy, setBusy] = React.useState(false);
  
  React.useEffect(() => {
    setEnv(env => ({...env, 
      title: 'Корзина',
      navline: ['Корзина']
    }))
  }, []);

  function makeOrderOnClick() {
    if (confirm('Оформить заказ?')) {
      setBusy(true); // блокируем кнопку
      //искусственная задержка. будто отправляем заказ на сервер
      setTimeout(() => {
        basketDispatch({type: BasketActionType.CLEAN});
        setBusy(false); 
        setTimeout(() => alert('Заказ оформлен. Спасибо!'));
      }, 1000);
    }
  }
  
  return (
    <div className='basket'>
      <h1 className='basket__title'>Корзина</h1>
      <div className='basket__content'>
        <div className='basket__info'>
          Всего товаров {basket.totalCount} на {basket.totalPrice} ₽
        </div> 
        <div className='basket__list'>
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
        {
          basket.totalCount > 0 ?
            <div className='basket__menu'>
              <button disabled={busy} onClick={makeOrderOnClick}>Оформить заказ</button>
            </div> 
          : null
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
      <div className='basket-item__body'>
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
        {`${count} шт на ${count * product.price} ₽`}
      </div>
      <div className='basket-item-menu__btns'>
        <button className='basket-item-menu__btn' 
          onClick={basketAdd}>+</button>{' '}
        <button className='basket-item-menu__btn' 
          disabled={count === 1} 
          onClick={basketSub}>–</button>{' '}
        <button className='basket-item-menu__btn' 
          onClick={basketDel}>x</button>
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
        В корзине {`${count} шт на ${count * product.price} ₽`}
      </div>
      <button className='product-basket-menu__btn' 
        onClick={basketAdd}>+</button>{' '}
      <button className='product-basket-menu__btn' 
        disabled={count === 0} 
        onClick={basketSub}>–</button>{' '}
      <button className='product-basket-menu__btn' 
        disabled={count === 0} 
        onClick={basketDel}>x</button>
    </div>
  )
}

// трей корзины для шапки
interface TBasketTrayProps {
  basketControl: TBasketControl
}

export function BasketTray(props: TBasketTrayProps) {

  const [basket, ] = props.basketControl;

  return (
    <div className='basket-tray'>
      <a href='#!basket'>
        В корзине товаров {basket.totalCount} на {basket.totalPrice} ₽
      </a>
    </div>
  );
}

// получение корзины из хранилища
async function dbGetBasket() {
  console.log('call dbGetBasket');
  return JSON.parse(localStorage.getItem('basket') ?? 'null') ?? defaultBasket;
}

// инициализация корзины
export async function initBasket(basketControl: TBasketControl) {
  const [ , basketDispatch] = basketControl;
  const basket = await dbGetBasket();
  basketDispatch({type: BasketActionType.INIT, args: basket});
}

