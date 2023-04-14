
import React from 'react';
import {useEnvControl} from './Env';
import {useRouterControl} from './Router';
import {TBasketControl, ProductBasketMenu} from './Basket';
import {initProducts} from '../data/products';
import {initProducers} from '../data/producers';
import {initCategories} from '../data/categories';

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

  const [env, setEnv] = useEnvControl();
  const [router, setRouter] = useRouterControl();

  let productId = parseInt(router.hashParams['id']);
  if (!isFinite(productId)) {
    productId = 0;
  }

  const [product, setProduct] = React.useState({} as TProduct);

  async function getProduct() {
    const product = await fetchProduct(productId);
    setProduct(product);
  }

  React.useEffect(() => {
    getProduct();
  }, []);

  React.useEffect(() => {
    const title = product ? 
      (product.title ?? 'Загрузка...') : 'Продукт не найден';
    const navline = [
      <a href='#!catalog'>Каталог</a>, product?.title ?? '' ];
    setEnv(env => ({...env, 
      title: title,
      navline: navline
    }));
  }, [product])

  if (!product?.title) {
    return (
      <div className='product-page'>
        <div className='product-page__msg'>
          <b>{ product ? 'Загрузка...' : 'Продукт не найден' }</b>
        </div>
      </div>
    )
  }

  return (
    <div className='product-page'>
      <h1 className='product-page__title'>
        {product.title}
      </h1>
      <div className='product-page__content'>
        <div className='product-page__body'>
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
        <div className='catalog-product-card__producer'>
          Производитель: {product.producer}
        </div>
        <div className='catalog-product-card__code'>
          Штрихкод: {product.code}
        </div>
        <div className='catalog-product-card__categories'>
          Категории: {product.categories.join(', ')}
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
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('products') ?? 'null') ?? [];
  const product = productsAll.find(pr => pr.id === productId) as TProduct;
  return product;
}

// получение всех продуктов
export async function fetchProductsAll()  {
  console.log('call fetchProductsAll');
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('products') ?? 'null') ?? [];
  return productsAll;
}

// запись продуктов
export async function deleteProduct(productId: number)  {
  console.log('call deleteProduct, productId=' + productId); 
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('products') ?? 'null') ?? [];
  const index = productsAll.findIndex(pr => pr.id === productId);
  if (index >= 0) {
    productsAll.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(productsAll));
    return true;
  }
  else {
    return false;
  }
}

/**********/

// инициализация продуктов на "сервере"
if( true || !localStorage.getItem('products') ) {
  localStorage.setItem('products', JSON.stringify(initProducts));
}

// инициализация производителей на "сервере"
if( true || !localStorage.getItem('producers') ) {
  localStorage.setItem('producers', JSON.stringify(initProducers));
}

// инициализация категорий на "сервере"
if( true || !localStorage.getItem('categories') ) {
  localStorage.setItem('categories', JSON.stringify(initCategories));
}