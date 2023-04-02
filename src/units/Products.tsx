
import React from 'react';
import {TBasketControl, BasketActionType} from './Basket';

export interface TProduct {
  id: number,
  title: string,
  price: number,
  description: string,
  producer: string,
  code: string,
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
        <button className='product-card__btn' onClick={handlerSub}>–</button>{' '}
        <button className='product-card__btn' onClick={handlerDel}>x</button>
      </div>
    </div>
  );
}
