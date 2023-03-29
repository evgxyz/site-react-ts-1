
import React, {useState, useEffect, useRef} from 'react';
import {useStateMerge} from './utils';
import {TBasketControl} from './Basket';
import {TProduct, TProducer, TCategory, ProductCard} from './Products';
import {initProducts} from '../data/products';
import {initProducers} from '../data/producers';
import {initCategories} from '../data/categories';

interface TFilterParams {
  priceFr: number,
  priceTo: number,
  producers: string[],
  categories: string[],
}

const initFilterParams: TFilterParams = {
  priceFr: 0,
  priceTo: Infinity,
  producers: [],
  categories: [],
}

/**************************/
// каталог
export interface TCatalogProps {
  basketControl: TBasketControl
}

export function Catalog(props: TCatalogProps) {

  const [filterParams, setFilterParams] = useStateMerge(initFilterParams);
  const [productList, setProductList] = useState([] as TProduct[]);

  async function updateProductList() {
    const newProductList = await fetchProducts(filterParams);
    setProductList(newProductList);
  }

  useEffect(() => {updateProductList()}, [filterParams]);

  return (
    <div className='catalog'>
      <pre>{JSON.stringify(filterParams)}</pre>
      <div className='catalog__categories'>
        {/* <ProductCategories filterParamsControl={[filterParams, setFilterParams]} /> */}
      </div>
      <div className='catalog__filter'>
        <ProductFilter filterParamsControl={[filterParams, setFilterParams]} />
      </div>
      <div className='catalog__product-list'>
        { 
          productList.map((product) => 
            <ProductCard key={product.id} product={product} basketControl={props.basketControl} />
          )
        }
      </div>
    </div>
  );
}

/**************************/
// фильтр основной
interface TProductFilterProps {
  filterParamsControl: [TFilterParams, (v: TFilterParams) => void]
}

function ProductFilter(props: TProductFilterProps) {
  // глобальные параметры фильтра
  const [filterParams, setFilterParams] = props.filterParamsControl;
  // локальные параметры фильтра (записываются в глобальные параметры при отправке формы)
  // цена от и до
  const [priceFr, setPriceFr] = useState('0');
  const [priceTo, setPriceTo] = useState('1000');
  // ссылка на список производителей
  const filterProducersRef = useRef<HTMLDivElement>(null);
  // ссылка на список категорий
  const filterCategoriesRef = useRef<HTMLDivElement>(null);

  // обновляем параметры фильтра
  function updateFilterParams() {
    const newPriceFr = parseInt(priceFr);
    const newPriceTo = parseInt(priceTo);
    
    const newProducers = 
      Array.from(filterProducersRef.current?.querySelectorAll('input[name="producer"]:checked') ?? [])
      .map(el => el.getAttribute('data-title') ?? '')
      .filter(s => (s !== ''));

    const newCategories = 
      Array.from(filterCategoriesRef.current?.querySelectorAll('input[name="category"]:checked') ?? [])
      .map(el => el.getAttribute('data-title') ?? '')
      .filter(s => (s !== ''));

    setFilterParams({
      priceFr: newPriceFr,
      priceTo: newPriceTo,
      producers: newProducers,
      categories: newCategories,
    });
  }

  function filterFormSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    updateFilterParams();
  }

  function priceFrOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setPriceFr(ev.currentTarget.value);
  }

  function priceToOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setPriceTo(ev.currentTarget.value);
  }

  return (
    <form className='filter__form' onSubmit={filterFormSubmit}>
      <div className='filter__price'>
        <div>Цена</div>
        <input type='text' value={priceFr} onChange={priceFrOnChange} />
        <input type='text' value={priceTo} onChange={priceToOnChange} />
      </div>
      <div ref={filterProducersRef} className='filter__producers'>
        <div>Производитель</div>
        <FilterProducers />
      </div>
      <div ref={filterCategoriesRef} className='filter__categories'>
        <div>Категории</div>
        <FilterCategories />
      </div>
      <button type='submit'>Показать</button>
    </form>
  );
}

/**************************/
// подфильтр по производителю
function FilterProducers() {
  
  const [producers, setProducers] = useState([] as TProducer[]);
  const [producerQuery, setProducerQuery] = useState('');

  // получение списка производителей 
  async function updateProducers() {
    const newProducers = await fetchProducers(producerQuery);
    setProducers(newProducers);
  }

  // при первом рендере
  useEffect(() => {updateProducers()}, []);

  // поиск производителей
  function producerQuerySubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    updateProducers();
  }

  // обработчик поля ввода
  function producerQueryOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setProducerQuery(ev.currentTarget.value);
  }

  return (
    <>
      <form onSubmit={producerQuerySubmit}>
        <input type='text' value={producerQuery} onChange={producerQueryOnChange} />
        <button onClick={producerQuerySubmit}>Найти</button>
      </form>
      <ul className='filter__producers-list'>
        { 
          producers.map(producer => {
            return (
              <li key={producer.id}>
                <label>
                  <input type='checkbox' name='producer' data-title={producer.title} />
                    {producer.title}
                  </label>
              </li>
            );
          })
        }
      </ul>
    </>
  );
}

/**************************/
// подфильтр по категориям
function FilterCategories() {
  
  const [categories, setCategories] = useState([] as TCategory[]);

  // получение списка категорий
  async function updateCategories() {
    const newCategories = await fetchCategories();
    setCategories(newCategories);
  }

  // при первом рендере
  useEffect(() => {updateCategories()}, []);

  return (
    <ul className='filter__categories-list'>
      { 
        categories.map(category => {
          return (
            <li key={category.id}>
              <label>
                <input type='checkbox' name='category' data-title={category.title} />
                  {category.title}
                </label>
            </li>
          );
        })
      }
    </ul>
  );
}

/**************************/

// получение списка продкутов с "сервера"
async function fetchProducts(filterParams: TFilterParams) {
  const products: TProduct[] = JSON.parse(String(localStorage.getItem('products'))) ?? [];
  const filteredProducts = products.filter(product => {
      return (
        // цена
        ( (!isFinite(filterParams.priceFr) || product.price >= filterParams.priceFr) && 
          (!isFinite(filterParams.priceTo) || product.price <= filterParams.priceTo) ) &&
        // производитель
        ( filterParams.producers.length == 0 || 
          filterParams.producers.includes(product.producer) ) &&
        // категории
        ( filterParams.categories.length == 0 || 
          (() => {
            for (let category of product.categories) {
              if (filterParams.categories.includes(category)) return true;
            }
            return false;
          })() )
      );
    });
  return filteredProducts;
}

// получение списка производителей с "сервера"
async function fetchProducers(producerQuery: string) {
  const producers: TProducer[] = JSON.parse(String(localStorage.getItem('producers'))) ?? [];
  const filteredProducers = producers.filter(producer =>
    producer.title.toLowerCase().includes(producerQuery.toLowerCase())
  );
  return filteredProducers;
}

// получение списка категорий с "сервера"
async function fetchCategories() {
  const categories: TCategory[] = JSON.parse(String(localStorage.getItem('categories'))) ?? [];
  return categories;
}

/**************************/

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