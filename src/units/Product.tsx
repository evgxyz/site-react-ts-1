
import React from 'react';
import {useRouterControl} from './Router';
import {TBasketControl, ProductBasketMenu} from './Basket';

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

// страница продукта 
export interface TProductPageProps {
  basketControl: TBasketControl
}

export function ProductPage(props: TProductPageProps) {

  const [router, ] = useRouterControl();

  let productId = parseInt(router.hashParams['id']);
  if (!isFinite(productId)) {
    productId = 0;
  }

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

  document.title = product.title;

  return (
    <div className='product-page'>
      <div className='product-page__body'>
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
          Категории: {product.categories.join(', ')}
        </div>
        <div className='product-page__producer'>
          Производитель: {product.producer}
        </div>
        <div className='product-page__code'>
          Штрихкод: {product.code}
        </div>
      </div>
      <div className='product-page__menu'>
        <ProductBasketMenu 
          product={product}
          basketControl={props.basketControl} 
        />
      </div>
    </div>
  );
}

// карточка продукта в каталоге
export interface TProductCardProps {
  product: TProduct,
  basketControl: TBasketControl
}

export function CatalogProductCard(props: TProductCardProps) {

  const product = props.product;

  return (
    <div className='catalog-product-card'>
      <div className='catalog-product-card__body'>
        <div className='catalog-product-card__title'>
          <a href={`#!product?id=${product.id}`}>
            {product.title}
          </a>
        </div>
        <div className='catalog-product-card__description'>
          {product.description}
        </div>
        <div className='catalog-product-card__price'>
          Цена: {product.price} ₽
        </div>
        <div className='catalog-product-card__categories'>
          Категории: {product.categories.join(', ')}
        </div>
        <div className='catalog-product-card__producer'>
          Производитель: {product.producer}
        </div>
        <div className='catalog-product-card__code'>
          Штрихкод: {product.code}
        </div>
      </div>
      <div className='catalog-product-card__menu'>
        <ProductBasketMenu 
          product={product}
          basketControl={props.basketControl} 
        />
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
