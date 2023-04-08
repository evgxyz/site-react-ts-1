
import React from 'react';
import {useRouterControl} from './Router';
import {TBasketControl, BasketActionType} from './Basket';

// продукт
export interface TProduct {
  id: number,
  title: string,
  price: number,
  description: string,
  producer: string,
  code: string,
  categories: string[],
}

// производитель
export interface TProducer {
  id: number,
  title: string,
}

// категория
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

  const [basket, basketDispatch] = props.basketControl;

  const count = basket.products
    .find(pr => pr.id === props.product.id)?.count ?? 0;

  function basketAdd() {
    basketDispatch({type: BasketActionType.ADD, args: props.product});
  }

  function basketSub() {
    basketDispatch({type: BasketActionType.SUB, args: props.product});
  }

  function basketDel() {
    basketDispatch({type: BasketActionType.DEL, args: props.product});
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
          { 'Категории: ' + props.product.categories.join(', ') }
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
        <button className='product-card__btn' onClick={basketAdd}>+</button>{' '}
        <button className='product-card__btn' onClick={basketSub}>–</button>{' '}
        <button className='product-card__btn' onClick={basketDel}>x</button>
      </div>
    </div>
  );
}

// страница продукта 
export interface TProductPageProps {
  basketControl: TBasketControl
}

export function ProductPage(props: TProductPageProps) {

  const [router, setRouter] = useRouterControl();

  let productId = parseInt(router.hashParams['id']);
  if (!isFinite(productId)) {
    productId = 0;
  }

  const [basket, basketDispatch] = props.basketControl;

  const [product, setProduct] = React.useState({} as TProduct);

  async function getProduct() {
    const product = await fetchProduct(productId);
    setTimeout(() => setProduct(product), 500);
  }

  React.useEffect(() => {
    getProduct();
  }, []);

  if (!product) {
    document.title = 'Продукт не найден';
    return (
      <div className='product-page'>
        <div className='product-page__content'>
         <b>Продукт не найден</b>
        </div>
      </div>
    )
  }

  if (!product.id) {
    document.title = 'Загрузка...';
    return (
      <div className='product-page'>
        <div className='product-page__content'>
         <b>Загрузка...</b>
        </div>
      </div>
    )
  }

  const count = basket.products
    .find(pr => pr.id === productId)?.count ?? 0;

  function basketAdd() {
    basketDispatch({type: BasketActionType.ADD, args: product});
  }

  function basketSub() {
    basketDispatch({type: BasketActionType.SUB, args: product});
  }

  function basketDel() {
    basketDispatch({type: BasketActionType.DEL, args: product});
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
          {'Категории: ' + product.categories.join(', ')}
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
        <button className='product-page__btn' onClick={basketAdd}>+</button>{' '}
        <button className='product-page__btn' onClick={basketSub}>–</button>{' '}
        <button className='product-page__btn' onClick={basketDel}>x</button>
      </div>
    </div>
  );
}

// получение продукта
export async function fetchProduct(productId: number)  {
  console.log('call fetchProduct, productId=' + productId); 
  const productsAll: TProduct[] = 
    (JSON.parse(localStorage.getItem('products') ?? 'null')) ?? [];
  const product = productsAll.find(pr => pr.id === productId) as TProduct;
  return product;
}
