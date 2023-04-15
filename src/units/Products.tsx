
import React from 'react';
import {compare} from './utils';
import {useEnvControl} from './Env';
import {useRouterControl} from './Router';
import {TBasketControl, ProductBasketMenu} from './Basket';
import {initProductsAll} from '../data/productsAll';
import {initProducersAll} from '../data/producersAll';
import {initCategoriesAll} from '../data/categoriesAll';

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

// шаблон продукта
export const templateProduct = {
  id: 0,
  title: '', 
  price: 0,
  description: '',
  producer: '',
  code: '',
  categories: []
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
    const product = await dbGetProduct(productId);
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
export async function dbGetProduct(productId: number)  {
  console.log('call dbGetProduct, productId=' + productId); 
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('productsAll') ?? 'null') ?? [];
  const product = productsAll.find(pr => pr.id === productId) as TProduct;
  return product;
}

// получение всех продуктов
export async function dbGetProductsAll()  {
  console.log('call dbGetProductsAll');
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('productsAll') ?? 'null') ?? [];
  return productsAll;
}

// добавление продукта на "сервере"
export async function dbAddProduct(newProduct: TProduct)  {
  console.log('call dbAddProduct'); 
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('productsAll') ?? 'null') ?? [];

  let insertId = 
    (JSON.parse(localStorage.getItem('productsAllLastId') ?? 'null') ?? -1) + 1;

  productsAll.push({...newProduct, id: insertId});

  localStorage.setItem('productsAll', JSON.stringify(productsAll));
  localStorage.setItem('productsAllLastId', JSON.stringify(insertId));

  return [true, insertId];
}

// редактирование продукта на "сервере"
export async function dbEditProduct(newProduct: TProduct)  {
  console.log('call dbEditProduct, productId=' + newProduct.id); 
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('productsAll') ?? 'null') ?? [];
  const index = productsAll.findIndex(pr => pr.id === newProduct.id);
  if (index >= 0) {
    productsAll[index] = newProduct;
    localStorage.setItem('productsAll', JSON.stringify(productsAll));
    return true;
  }
  else {
    return false;
  }
}

// удаление продукта на "сервере"
export async function dbDelProduct(productId: number)  {
  console.log('call dbDelProduct, productId=' + productId); 
  
  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 700)});

  const productsAll: TProduct[] = 
    JSON.parse(localStorage.getItem('productsAll') ?? 'null') ?? [];
  const index = productsAll.findIndex(pr => pr.id === productId);
  if (index >= 0) {
    productsAll.splice(index, 1);
    localStorage.setItem('productsAll', JSON.stringify(productsAll));
    return true;
  }
  else {
    return false;
  }
}

// получение списка производителей с "сервера"
export async function dbGetProducers(query: string = '') {
  console.log('call dbGetProducers');

  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 50)});

  query = query.trim();
  const producersAll: TProducer[] = 
    (JSON.parse(String(localStorage.getItem('producersAll'))) ?? []);
  const producers = producersAll.filter(x =>
    x.title.toLowerCase().includes(query.toLowerCase())
  )
  .sort(
    (x, y) => compare(x.title, y.title) 
  );
  return producers;
}

// получение списка категорий с "сервера"
export async function dbGetCategories() {
  console.log('call dbGetCategories');

  //искусственная задержка
  await new Promise(resolve => {setTimeout(() => resolve(1), 500)});

  const categoriesAll: TCategory[] = 
    (JSON.parse(String(localStorage.getItem('categoriesAll'))) ?? [])
  const categories = categoriesAll.sort(
    (x, y) => compare(x.title, y.title) 
  );
  return categories;
}

/**********/

// инициализация продуктов на "сервере"
if ( !( localStorage.getItem('productsAll') && 
        localStorage.getItem('productsAllLastId') ) ) {
  const lastId = initProductsAll.reduce((maxId, pr) => Math.max(maxId, pr.id), 0);
  localStorage.setItem('productsAll', JSON.stringify(initProductsAll));
  localStorage.setItem('productsAllLastId', JSON.stringify(lastId));
}

// инициализация производителей на "сервере"
if ( true || !localStorage.getItem('producersAll') ) {
  localStorage.setItem('producersAll', JSON.stringify(initProducersAll));
}

// инициализация категорий на "сервере"
if ( true || !localStorage.getItem('categoriesAll') ) {
  localStorage.setItem('categoriesAll', JSON.stringify(initCategoriesAll));
}