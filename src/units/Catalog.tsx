
import React, {useState, useEffect, useCallback} from 'react';
import {isIntStr, mergeObj, addObj} from './utils';
import {TBasketControl} from './Basket';
import {TProduct, TProducer, TCategory, ProductCard} from './Products';
import {initProducts} from '../data/products';
import {initProducers} from '../data/producers';
import {initCategories} from '../data/categories';

interface TFilterParams {
  priceFr: number,
  priceTo: number,
  producers: (TProducer & {checked: boolean})[],
  categories: (TCategory & {checked: boolean})[],
}

const defaultPriceFr = 0;
const defaultPriceTo = 10000;

const defaultFilterParams: TFilterParams = {
  priceFr: defaultPriceFr, 
  priceTo: defaultPriceTo, 
  producers: [],
  categories: [],
}

/**************************/
// каталог
export interface TCatalogProps {
  basketControl: TBasketControl
}

export function Catalog(props: TCatalogProps) {

  const [productList, setProductList] = useState([] as TProduct[]);
  const [filterParams, setFilterParams] = useState(defaultFilterParams);
  const [updateFlag, setUpdateFlag] = useState(false);

  const updateProductList = useCallback(async function () {
    console.log('call updateProductList');
    if (updateFlag) {
      const newProductList = await fetchProducts(filterParams);
      setTimeout(() => {
        setProductList(newProductList);
        setUpdateFlag(false);
      }, 1000);
    }
  }, [updateFlag, filterParams]);
  
  async function initCatalog() {
    console.log('call initCatalog');
    // производитель
    const producersAll = await fetchProducers();
    const newProducers = producersAll.map(pr => mergeObj(pr, {checked: false}));

    // производитель
    const categoriesAll = await fetchCategories();
    const newCategories = categoriesAll.map(ct => mergeObj(ct, {checked: false}));

    setFilterParams(fp => { 
      setUpdateFlag(true);
      return mergeObj(fp, {
        producers: newProducers,
        categories: newCategories,
      }
    )});
  }

  useEffect(() => {initCatalog()}, []);

  useEffect(() => {updateProductList()}, [filterParams]);

  return (
    <div className='catalog'>
      <h1>Каталог</h1>
      <div className='catalog__hot-categories'>
        <HotCategories 
          filterParamsControl={[filterParams, setFilterParams]}
          updateFlagControl={[updateFlag, setUpdateFlag]}
        />
      </div>
      <div className='catalog__products'>
        <div className='catalog__products-filter'>
          <Filter 
            filterParamsControl={[filterParams, setFilterParams]} 
            updateFlagControl={[updateFlag, setUpdateFlag]}
          />
        </div>
        <div className='catalog__products-list'>
          { 
            updateFlag ? <b>Загрузка...</b> :
            productList.length > 0 ?
            productList.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  basketControl={props.basketControl} 
                />
              )
            ) : <b>Нет результатов</b>
          }
        </div>
      </div>
    </div>
  );
}

/**************************/
// фильтр основной
interface TFilterProps {
  filterParamsControl: [
    TFilterParams, 
    React.Dispatch<React.SetStateAction<TFilterParams>>
  ],
  updateFlagControl: [
    boolean, 
    React.Dispatch<React.SetStateAction<boolean>>
  ],
}

function Filter(props: TFilterProps) {

  const [filterParams, setFilterParams] = props.filterParamsControl;
  const [updateFlag, setUpdateFlag] = props.updateFlagControl;

  // отправить форму
  function filterFormSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    setFilterParams(fp => {
      setUpdateFlag(true); 
      return mergeObj(fp, {})
    });
  }

  return (
    <form className='filter__form' onSubmit={filterFormSubmit}>
      <fieldset className='filter__price'>
        <legend>Цена</legend>
        <FilterPrice filterParamsControl={props.filterParamsControl} />
      </fieldset>
      <fieldset className='filter__producers'>
        <legend>Производитель</legend>
        <FilterProducers filterParamsControl={props.filterParamsControl} />
      </fieldset>
      <fieldset className='filter__categories'>
        <legend>Категории</legend>
        <FilterCategories filterParamsControl={props.filterParamsControl} />
      </fieldset>
      <button type='submit'>Показать</button>
    </form>
  );
}

/**************************/
// подфильтр по цене
interface TFilterPriceProps {
  filterParamsControl: [
    TFilterParams, 
    React.Dispatch<React.SetStateAction<TFilterParams>>
  ]
}

function FilterPrice(props: TFilterPriceProps) {

  const [filterParams, setFilterParams] = props.filterParamsControl;

  // цена от
  const [priceFr, setPriceFr] = useState(defaultPriceFr.toString());
  function priceFrOnChange(ev: React.FormEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      setPriceFr(priceStr);
      let price = parseInt(priceStr);
      if (!isFinite(price)) { 
        price = defaultPriceFr;
      }
      setFilterParams(fp => mergeObj(fp, {priceFr: price}));
    }
  }

  // цена до
  const [priceTo, setPriceTo] = useState(defaultPriceTo.toString());
  function priceToOnChange(ev: React.FormEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      setPriceTo(priceStr);
      let price = parseInt(priceStr);
      if (!isFinite(price)) { 
        price = defaultPriceTo;
      }
      setFilterParams(fp => mergeObj(fp, {priceTo: price}));
    }
  }

  return (
    <>
      <input type='text' value={priceFr} onChange={priceFrOnChange} 
        placeholder='От' style={{width: '5em'}} /> 
      {' – '}
      <input type='text' value={priceTo} onChange={priceToOnChange} 
        placeholder='До' style={{width: '5em'}}/>
    </>
  )
}

/**************************/
// подфильтр по производителю
interface TFilterProducersProps {
  filterParamsControl: [
    TFilterParams, 
    React.Dispatch<React.SetStateAction<TFilterParams>>
  ]
}

function FilterProducers(props: TFilterProducersProps) {

  const [filterParams, setFilterParams] = props.filterParamsControl;
  
  const [queryProducers, setQueryProducers] = useState('');
  const [producerIds, setProducerIds] = useState([] as number[]);

  // получение списка производителей 
  const updateProducerIds = useCallback(async function () {
    const producers = await fetchProducers(queryProducers);
    const newProducerIds = producers.map(pr => pr.id);
    setProducerIds(newProducerIds);
  }, [queryProducers]);

  // при первом рендере
  useEffect(() => {updateProducerIds()}, [queryProducers]);

  // обработчик поля поиска
  function queryProducersOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setQueryProducers(ev.currentTarget.value);
  }

  // обработчик чекбокса
  function producerOnChange(producerId: number) {
    setFilterParams(fp => { 
      const newProducers = fp.producers.map(
        pr => (pr.id === producerId) ? addObj(pr, {checked: !pr.checked}) : pr
      );
      return mergeObj(fp, {producers: newProducers})
    });
  }

  const [expanded, setExpanded] = useState(false);

  function expandedToogleOnClick() {
    setExpanded(expanded => !expanded);
  }

  let producersList = filterParams.producers
    .filter(pr => (pr.checked || producerIds.includes(pr.id)));

  producersList.sort(
    (x, y) => (x.checked === y.checked ? 0 : x.checked < y.checked ? 1 : -1)
  );
  
  if (!expanded) {
    const maxLen = 3;
    producersList = producersList.filter((x, i) => x.checked || i < maxLen);
  }

  return (
    <>
      <div>
        <input type='text' value={queryProducers} placeholder='Найти' onChange={queryProducersOnChange} />
      </div>
      <ul className={['filter__producers-list', expanded ? '--expanded' : ''].join(' ')}>
        { 
          producersList.map(producer => {
              return (
                <li key={producer.id}>
                  <label>
                    <input type='checkbox' 
                      checked={producer.checked} 
                      onChange={() => {producerOnChange(producer.id)}}
                    />
                    {producer.title}
                  </label>
                </li>
              );
            }
          )
        }
      </ul>
      <span 
        className={['toggle-link toggle-link--expander', expanded ? '--expanded' : ''].join(' ')} 
        onClick={expandedToogleOnClick}>
        {expanded ? 'Свернуть' : 'Показать все'}
      </span>
    </>
  );
}

/**************************/
// подфильтр по категориям
interface TFilterCategoriesProps {
  filterParamsControl: [
    TFilterParams, 
    React.Dispatch<React.SetStateAction<TFilterParams>>
  ]
}

function FilterCategories(props: TFilterCategoriesProps) {
  
  const [filterParams, setFilterParams] = props.filterParamsControl;
  
  // обработчик чекбокса
  function categoryOnChange(categoryId: number) {
    setFilterParams(fp => { 
      const newCategories = fp.categories.map(
        ct => (ct.id == categoryId) ? addObj(ct, {checked: !ct.checked}) : ct
      );
      return mergeObj(fp, {categories: newCategories})
    });
  }

  const [expanded, setExpanded] = useState(false);

  function expandedToogleOnClick() {
    setExpanded(expanded => !expanded);
  }

  let cateroriesList = [...filterParams.categories];
  
  if (!expanded) {
    cateroriesList.sort(
      (x, y) => (x.checked == y.checked ? 0 : x.checked < y.checked ? 1 : -1)
    );
    
    const maxLen = 3;
    cateroriesList = cateroriesList.filter((x, i) => x.checked || i < maxLen);
  }

  return (
    <>
      <ul className={['filter__categories-list', expanded ? '--expanded' : ''].join(' ')}>
        { 
          cateroriesList.map(category => {
              return (
                <li key={category.id}>
                  <label>
                    <input type='checkbox' 
                      checked={category.checked} 
                      onChange={() => {categoryOnChange(category.id)}}
                    />
                    {category.title}
                  </label>
                </li>
              );
            }
          )
        }
      </ul>
      <span 
        className={['toggle-link toggle-link--expander', expanded ? '--expanded' : ''].join(' ')} 
        onClick={expandedToogleOnClick}>
        {expanded ? 'Свернуть' : 'Показать все'}
      </span>
    </>
  );
}

// /**************************/
// // подфильтр по категориям
interface THotCategoriesProps {
  filterParamsControl: [
    TFilterParams, 
    React.Dispatch<React.SetStateAction<TFilterParams>>
  ],
  updateFlagControl: [
    boolean, 
    React.Dispatch<React.SetStateAction<boolean>>
  ],
}

function HotCategories(props: THotCategoriesProps) {

  const [filterParams, setFilterParams] = props.filterParamsControl;
  const [updateFlag, setUpdateFlag] = props.updateFlagControl;

  // обработчик чекбокса
  function categoryOnChange(categoryId: number) {
    setFilterParams(fp => { 
      setUpdateFlag(true);
      const newCategories = fp.categories.map(
        ct => (ct.id == categoryId) ? addObj(ct, {checked: !ct.checked}) : ct
      );
      return mergeObj(fp, {categories: newCategories})
    });
  }

  let cateroriesList = [...filterParams.categories];
   /*  .sort(
      (x, y) => (x.checked == y.checked ? 0 : x.checked < y.checked ? 1 : -1)
    ); */

  return (
    <>
      <ul className='hot-categories-list'>
        { 
          cateroriesList.map(category => {
              return (
                <li key={category.id}>
                  <label>
                    <input type='checkbox' 
                      checked={category.checked} 
                      onChange={() => {categoryOnChange(category.id)}}
                    />
                    {category.title}
                  </label>
                </li>
              );
            }
          )
        }
      </ul>
    </>
  );
}

/**************************/

// получение списка продкутов с "сервера"
async function fetchProducts(filterParams: TFilterParams) {

  const producerTitles = filterParams.producers
    .filter(pr => pr.checked)
    .map(pr => pr.title);

  const categoryTitles = filterParams.categories
    .filter(ct => ct.checked)
    .map(ct => ct.title);

  const products: TProduct[] = JSON.parse(String(localStorage.getItem('products'))) ?? [];
  const filteredProducts = products.filter(product => {
      return (
        // цена
        ( (!isFinite(filterParams.priceFr) || product.price >= filterParams.priceFr) && 
          (!isFinite(filterParams.priceTo) || product.price <= filterParams.priceTo) ) &&
        // производитель
        ( producerTitles.length == 0 || producerTitles.includes(product.producer) ) &&
        // категории
        ( categoryTitles.length == 0 || 
          (() => {  
            for (let category of product.categories) {
              if (categoryTitles.includes(category)) return true;
            }
            return false;
          })() )
      );
    });
  return filteredProducts;
}

// получение списка производителей с "сервера"
async function fetchProducers(query: string = '') {
  query = query.trim();
  const producersAll: TProducer[] = JSON.parse(String(localStorage.getItem('producers'))) ?? [];
  
  const producers = producersAll.filter(x =>
    x.title.toLowerCase().includes(query.toLowerCase())
  )
  .sort(
    (x, y) => (x.title === y.title ? 0 : x.title > y.title ? 1 : -1)
  );
  return producers;
}

// получение списка категорий с "сервера"
async function fetchCategories() {
  const categoriesAll: TCategory[] = (JSON.parse(String(localStorage.getItem('categories'))) ?? [])
  const categories = categoriesAll.sort(
    (x, y) => (x.title === y.title ? 0 : x.title > y.title ? 1 : -1)
  );
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