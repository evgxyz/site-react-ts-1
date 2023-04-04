
import React from 'react';
import {useRouterControl} from './router';
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
          <a href={`#!product?id=${props.product.id}`}>
            {props.product.title}
          </a>
        </div>
        <div className='product-card__description'>
          {props.product.description}
        </div>
        <div className='product-card__price'>
          Цена: {props.product.price} ₽
        </div>
        <div className='product-card__categories'>
          { 'Категории: '
            + props.product.categories.map((ct, i) => (i > 0 ? ', ' : '') + ct) }
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

// страница продукта 
export interface TProductPageProps {
  productId: number,
  basketControl: TBasketControl
}

export function ProductPage(props: TProductPageProps) {

  const [product, setProduct] = React.useState({} as TProduct);

  async function getProduct() {
    const product = await fetchProduct(props.productId);
    setTimeout(() => setProduct(product), 1000);
  }

  React.useEffect(() => {
    getProduct();
  }, []);

  document.title = 'Продукт...';

  if (!product?.id) {
    return (
      <div className='product-page'>
        <div className='product-page__content'>
         { product ? <b>Загрузка...</b> : <b>Продукт не найден</b> }
        </div>
      </div>
    )
  }

  const count = props.basketControl.state.products
    .find(pr => pr.id === props.productId)?.count ?? 0;

  const handlerAdd = function() {
    props.basketControl.dispatch({type: BasketActionType.ADD, args: product});
  }

  const handlerSub = function() {
    props.basketControl.dispatch({type: BasketActionType.SUB, args: product});
  }

  const handlerDel = function() {
    props.basketControl.dispatch({type: BasketActionType.DEL, args: product});
  }

  document.title = product.title;

  return (
    <div className='product-page'>
      <div className='product-page__content'>
        <div className='product-page__title'>
          {product.title}
        </div>
        <div className='product-page__description'>
          {product.description}
        </div>
        <div className='product-page__price'>
          Цена: {product.price} ₽
        </div>
        <div className='product-page__categories'>
          { 'Категории: '
            + product.categories.map((ct, i) => (i > 0 ? ', ' : '') + ct) }
        </div>
        <div className='product-page__producer'>
          Производитель: {product.producer}
        </div>
        <div className='product-page__code'>
          Штрихкод: {product.code}
        </div>
      </div>
      <div className='product-page__menu'>
        <div className='product-page__menu-info'>
          {`В корзине ${count} шт на ${count*product.price} ₽`}
        </div>
        <button className='product-page__btn' onClick={handlerAdd}>+</button>{' '}
        <button className='product-page__btn' onClick={handlerSub}>–</button>{' '}
        <button className='product-page__btn' onClick={handlerDel}>x</button>
      </div>
    </div>
  );
}

// получение корзины из хранилища
export async function fetchProduct(productId: number)  {
  console.log('call fetchProduct, productId=' + productId);
  const productsAll: TProduct[] = 
    (JSON.parse(localStorage.getItem('products') ?? 'null')) ?? [];
  const product = productsAll.find(pr => pr.id === productId) as TProduct;
  return product;
}
