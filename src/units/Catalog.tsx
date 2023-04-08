
import React from 'react';
import {isIntStr, mergeObj, addObj} from './utils';
import {useRouterControl} from './Router';
import {TBasketControl} from './Basket';
import {TProduct, TProducer, TCategory, ProductCard} from './Product';
import {initProducts} from '../data/products';
import {initProducers} from '../data/producers';
import {initCategories} from '../data/categories';

interface TCatalogParams {
  priceFr: number,
  priceTo: number,
  producers: (TProducer & {checked: boolean})[],
  categories: (TCategory & {checked: boolean})[],
  updateFlag: boolean,
}

interface TCatalogResult {
  products: TProduct[],
  totalPages: number,
}

const defaultPriceFr = 0;
const defaultPriceTo = 10000;

const defaultCatalogParams: TCatalogParams = {
  priceFr: defaultPriceFr, 
  priceTo: defaultPriceTo, 
  producers: [],
  categories: [],
  updateFlag: false,
}

const defaultCatalogResult: TCatalogResult = {
  products: [],
  totalPages: 0,
}

/**************************/
// каталог
export interface TCatalogProps {
  basketControl: TBasketControl
}

export function Catalog(props: TCatalogProps) {

  const [router, setRouter] = useRouterControl();

  let page = parseInt(router.hashParams['page']);
  if (!isFinite(page)) {
    page = 1;
  }

  const [catalogParams, setCatalogParams] = React.useState(defaultCatalogParams);
  const [catalogResult, setCatalogResult] = React.useState(defaultCatalogResult);

  const updateCatalogResult = React.useCallback(async function () {
    console.log('call updateCatalogResult');
    if (catalogParams.updateFlag) {    
      const {products, totalPages} = await fetchProducts(catalogParams, page);
      setTimeout(() => {
        setCatalogParams(cp => mergeObj(cp, {updateFlag: false}));
        setCatalogResult(cr => mergeObj(cr, {
          products: products,
          totalPages: totalPages,
        }));
      }, 500);
    }
  }, [catalogParams, page]);
  
  async function initCatalogParams() {
    console.log('call initCatalog');
    // производитель
    const producersAll = await fetchProducers();
    const producers = producersAll.map(pr => mergeObj(pr, {checked: false}));

    // производитель
    const categoriesAll = await fetchCategories();
    const categories = categoriesAll.map(ct => mergeObj(ct, {checked: false}));

    setCatalogParams(cp => { 
      return mergeObj(cp, {
        producers: producers,
        categories: categories,
        updateFlag: true
      }
    )});
  }

  React.useEffect(() => {
    initCatalogParams()
  }, []);

  React.useEffect(() => {
    updateCatalogResult();
  }, [catalogParams, updateCatalogResult]);

  React.useEffect(() => {
    setCatalogParams(cp => mergeObj(cp, {updateFlag: true}));
  }, [page]);

  document.title = 'Каталог [' + page + ']';

  return (
    <div className='catalog'>
      <h1>Каталог</h1>
      <div className='catalog__hot-categories'>
        <HotCategories 
          catalogParamsControl={[catalogParams, setCatalogParams]}
        />
      </div>
      <div className='catalog__body'>
        <div className='catalog__filter'>
          <Filter 
            catalogParamsControl={[catalogParams, setCatalogParams]} 
          />
        </div>
        <div className='catalog__result'>
          <div className='catalog__products'>
            { 
              catalogParams.updateFlag ? <b>Загрузка...</b> :
              catalogResult.products.length > 0 ?
              catalogResult.products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  basketControl={props.basketControl} 
                />)
              ) : <b>Нет результатов</b>
            }
          </div>
          <div className='catalog__products-pagination'>
            { 
              Array.from(Array(catalogResult.totalPages).keys()).map(i => 
                <span key={i+1}>
                  <a href={'#!catalog?page='+(i+1)}>{i+1}</a>{' '}
                </span> 
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/**************************/
// фильтр основной
interface TFilterProps {
  catalogParamsControl: [
    TCatalogParams, 
    React.Dispatch<React.SetStateAction<TCatalogParams>>
  ]
}

function Filter(props: TFilterProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  // отправить форму
  function filterFormSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    setCatalogParams(cp => mergeObj(cp, {updateFlag: true}));
  }

  return (
    <form className='filter__form' onSubmit={filterFormSubmit}>
      <fieldset className='filter__price'>
        <legend>Цена</legend>
        <FilterPrice catalogParamsControl={props.catalogParamsControl} />
      </fieldset>
      <fieldset className='filter__producers'>
        <legend>Производитель</legend>
        <FilterProducers catalogParamsControl={props.catalogParamsControl} />
      </fieldset>
      <fieldset className='filter__categories'>
        <legend>Категории</legend>
        <FilterCategories catalogParamsControl={props.catalogParamsControl} />
      </fieldset>
      <button type='submit'>Показать</button>
    </form>
  );
}

/**************************/
// подфильтр по цене
interface TFilterPriceProps {
  catalogParamsControl: [
    TCatalogParams, 
    React.Dispatch<React.SetStateAction<TCatalogParams>>
  ]
}

function FilterPrice(props: TFilterPriceProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  // цена от
  const [priceFr, setPriceFr] = React.useState(defaultPriceFr.toString());

  function priceFrOnChange(ev: React.FormEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      setPriceFr(priceStr);
      let price = parseInt(priceStr);
      if (!isFinite(price)) { 
        price = defaultPriceFr;
      }
      setCatalogParams(fp => mergeObj(fp, {priceFr: price}));
    }
  }

  // цена до
  const [priceTo, setPriceTo] = React.useState(defaultPriceTo.toString());

  function priceToOnChange(ev: React.FormEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      setPriceTo(priceStr);
      let price = parseInt(priceStr);
      if (!isFinite(price)) { 
        price = defaultPriceTo;
      }
      setCatalogParams(fp => mergeObj(fp, {priceTo: price}));
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
  catalogParamsControl: [
    TCatalogParams, 
    React.Dispatch<React.SetStateAction<TCatalogParams>>
  ]
}

function FilterProducers(props: TFilterProducersProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;
  
  const [queryProducers, setQueryProducers] = React.useState('');
  const [producerIds, setProducerIds] = React.useState([] as number[]);

  // получение списка производителей 
  const updateProducerIds = React.useCallback(async function () {
    const producers = await fetchProducers(queryProducers);
    const newProducerIds = producers.map(pr => pr.id);
    setProducerIds(newProducerIds);
  }, [queryProducers]);

  // при первом рендере
  React.useEffect(() => {updateProducerIds()}, [queryProducers]);

  // обработчик поля поиска
  function queryProducersOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setQueryProducers(ev.currentTarget.value);
  }

  // обработчик чекбокса
  function producerOnChange(producerId: number) {
    setCatalogParams(fp => { 
      const newProducers = fp.producers.map(
        pr => (pr.id === producerId) ? addObj(pr, {checked: !pr.checked}) : pr
      );
      return mergeObj(fp, {producers: newProducers})
    });
  }

  const [expanded, setExpanded] = React.useState(false);

  function expandedToogleOnClick() {
    setExpanded(expanded => !expanded);
  }

  let producersList = catalogParams.producers
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
        <input type='text' value={queryProducers} placeholder='Найти' 
          onChange={queryProducersOnChange} />
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
  catalogParamsControl: [
    TCatalogParams, 
    React.Dispatch<React.SetStateAction<TCatalogParams>>
  ]
}

function FilterCategories(props: TFilterCategoriesProps) {
  
  const [catalogParams, setCatalogParams] = props.catalogParamsControl;
  
  // обработчик чекбокса
  function categoryOnChange(categoryId: number) {
    setCatalogParams(fp => { 
      const newCategories = fp.categories.map(
        ct => (ct.id == categoryId) ? addObj(ct, {checked: !ct.checked}) : ct
      );
      return mergeObj(fp, {categories: newCategories})
    });
  }

  const [expanded, setExpanded] = React.useState(false);

  function expandedToogleOnClick() {
    setExpanded(expanded => !expanded);
  }

  let cateroriesList = [...catalogParams.categories];
  
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
  catalogParamsControl: [
    TCatalogParams, 
    React.Dispatch<React.SetStateAction<TCatalogParams>>
  ]
}

function HotCategories(props: THotCategoriesProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  // обработчик чекбокса
  function categoryOnChange(categoryId: number) {
    setCatalogParams(cp => { 
      const categories = cp.categories.map(
        ct => (ct.id == categoryId) ? addObj(ct, {checked: !ct.checked}) : ct
      );
      return mergeObj(cp, {categories: categories, updateFlag: true})
    });
  }
  
  return (
    <>
      <ul className='hot-categories-list'>
        { 
          catalogParams.categories.map(category => {
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
async function fetchProducts(catalogParams: TCatalogParams, page: number = 1) {

  const perPage = 6;
  page = Math.max(1, page);

  const producerTitles = catalogParams.producers
    .filter(pr => pr.checked)
    .map(pr => pr.title);

  const categoryTitles = catalogParams.categories
    .filter(ct => ct.checked)
    .map(ct => ct.title);

  const productsAll: TProduct[] = JSON.parse(String(localStorage.getItem('products'))) ?? [];
  const products = productsAll.filter(product => {
      return (
        // цена
        ( (!isFinite(catalogParams.priceFr) || product.price >= catalogParams.priceFr) && 
          (!isFinite(catalogParams.priceTo) || product.price <= catalogParams.priceTo) ) &&
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
  const indexFrom = perPage*(page - 1);
  const indexTo = indexFrom + perPage;
  return {
    products: products.slice(indexFrom, indexTo),
    totalPages: Math.ceil(products.length / perPage),
  };
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