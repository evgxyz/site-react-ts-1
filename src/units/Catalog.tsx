
import React from 'react';
import {isIntStr, range, compare} from './utils';
import {TStateControl} from './stateControl'
import {useRouterControl} from './Router';
import {TBasketControl} from './Basket';
import {TProduct, TProducer, TCategory, CatalogProductCard} from './Product';
import {initProducts} from '../data/products';
import {initProducers} from '../data/producers';
import {initCategories} from '../data/categories';

interface TCatalogParams {
  priceFr: number,
  priceTo: number,
  producers: (TProducer & {checked: boolean})[],
  categories: (TCategory & {checked: boolean})[],
  sort: string,
  updateResultFlag: boolean,
  resetPageFlag: boolean,
  initFlag: boolean,
}

interface TCatalogResult {
  products: TProduct[],
  totalPages: number,
}

type TCatalogParamsControl = TStateControl<TCatalogParams>;

const sortTypes: string[] = [
  'price',
  'price_DESC',
  'title',
  'title_DESC',
]; 

const sortTypeTexts: {[sortType: string]: string} = {
  price: 'По цене ↑',
  price_DESC: 'По цене ↓',
  title: 'По названию ↑',
  title_DESC: 'По названию ↓',
};

const defaultPriceFr = 0;
const defaultPriceTo = 10000;
const defaultSort = 'price';

const defaultCatalogParams: TCatalogParams = {
  priceFr: defaultPriceFr, 
  priceTo: defaultPriceTo, 
  producers: [],
  categories: [],
  sort: defaultSort,
  updateResultFlag: false, //обновить результаты поиска?
  resetPageFlag: false, //сбросить страницу на 1?
  initFlag: false, //параметры пронициализированы?
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

  // номер страницы
  let page = parseInt(router.hashParams['page']);
  if (!isFinite(page)) {
    page = 1;
  }

  // цена
  let priceFr = parseInt(router.hashParams['priceFr']);
  if (!isFinite(priceFr)) {
    priceFr = defaultPriceFr;
  }

  let priceTo = parseInt(router.hashParams['priceTo']);
  if (!isFinite(priceTo)) {
    priceTo = defaultPriceTo;
  }

  // производители
  let producerIds = (router.hashParams['producerIds'] ?? '')
    .split('_').map(s => parseInt(s)).filter(id => isFinite(id));

  // категории
  let categoryIds = (router.hashParams['categoryIds'] ?? '')
    .split('_').map(s => parseInt(s)).filter(id => isFinite(id));

  // сортировка
  let sort = (router.hashParams['sort'] ?? '')
  if (!sortTypes.includes(sort)) {
    sort = defaultSort;
  }

  const [catalogParams, setCatalogParams] = React.useState(defaultCatalogParams);
  const [catalogResult, setCatalogResult] = React.useState(defaultCatalogResult);

  const updateCatalogResult = React.useCallback(async function () {
    
    if (catalogParams.updateResultFlag && catalogParams.initFlag) {
      console.log('call updateCatalogResult: ', JSON.stringify(catalogParams));    

      if (catalogParams.resetPageFlag) {
        const hashQuery = catalogParamsHashQuery(catalogParams);
        hashQuery.append('page', '1');
        window.location.hash = '#!catalog?' + hashQuery.toString();
        if (page !== 1) {
          return;
        }
      }

      const {products, totalPages} = await fetchProducts(catalogParams, page);
      setTimeout(() => {
        setCatalogParams(cp => ({...cp, 
          updateResultFlag: false,
          resetPageFlag: false,
        }));
        setCatalogResult(cr => ({...cr, 
          products: products,
          totalPages: totalPages,
        }));
      }, 500);
    }
  }, [catalogParams, page]);
  
  async function initCatalogParams() {
    console.log('call initCatalog');

    // производители
    const producersAll = await fetchProducers();
    const producers = producersAll.map(pr => 
      ({...pr, checked: producerIds.includes(pr.id)})
    );

    // категории
    const categoriesAll = await fetchCategories();
    const categories = categoriesAll.map(ct => 
      ({...ct, checked: categoryIds.includes(ct.id)})
    );

    setCatalogParams(cp => { 
      return ({...cp, 
        priceFr: priceFr,
        priceTo: priceTo,
        producers: producers,
        categories: categories,
        sort: sort,
        updateResultFlag: true,
        resetPageFlag: false,
        initFlag: true,
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
    setCatalogParams(cp => ({...cp, 
      updateResultFlag: true,
      resetPageFlag: false
    }));
  }, [page]);

  document.title = `Каталог [${page}]`;
  let hashQueryStr = catalogParamsHashQuery(catalogParams).toString();
  let hashStr = '#!catalog' + (hashQueryStr !== '' ? `?${hashQueryStr}&` : '?');

  return (
    <div className='catalog'>
      <h1>Каталог</h1>
      {/* <pre>{JSON.stringify(catalogParams)}</pre> */}
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
            <div className='catalog__sort'>
              <CatalogSort 
                catalogParamsControl={[catalogParams, setCatalogParams]} 
              />
            </div>
            { 
              catalogParams.updateResultFlag ? 
              <div className='catalog__msg'>
                <div><b>Загрузка...</b></div>
              </div> 
            : <>
              <div className='catalog__products'>
                { 
                  catalogResult.products.length > 0 ?
                  catalogResult.products.map(product => (
                    <CatalogProductCard 
                      key={product.id} 
                      product={product} 
                      basketControl={props.basketControl} 
                    />
                  )) 
                  : <b>Нет результатов</b>
                }
              </div>
              <div className='catalog__products-pagination'>
                { 
                  range(1, catalogResult.totalPages).map(i => (
                    <span key={i}>
                      { i > 1 ? ' | ' : '' }
                      { i !== page ? 
                          <a href={hashStr + 'page=' + i}>{i}</a> 
                        : <b>{i}</b>
                      }
                    </span> 
                  ))
                }
              </div>
              </>
          }
        </div>
      </div>
    </div>
  );
}

/**************************/
// фильтр основной
interface TFilterProps {
  catalogParamsControl: TCatalogParamsControl
}

function Filter(props: TFilterProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  // отправить форму
  function filterFormSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    setCatalogParams(cp => ({...cp, 
      updateResultFlag: true,
      resetPageFlag: true
    }));
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
  catalogParamsControl: TCatalogParamsControl
}

function FilterPrice(props: TFilterPriceProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  const [priceFr, setPriceFr] = React.useState('');
  const [priceTo, setPriceTo] = React.useState('');

  React.useEffect(() => {
    setPriceFr(catalogParams.priceFr.toString());
    setPriceTo(catalogParams.priceTo.toString());
  }, []);

  // цена от
  function priceFrOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      setPriceFr(priceStr);
      let price = parseInt(priceStr);
      if (!isFinite(price)) {  
        price = defaultPriceFr;
      }
      setCatalogParams(fp => ({...fp, priceFr: price}));
    }
  }

  // цена до
  function priceToOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      setPriceTo(priceStr);
      let price = parseInt(priceStr);
      if (!isFinite(price)) { 
        price = defaultPriceTo;
      }
      setCatalogParams(fp => ({...fp, priceTo: price}));
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
  catalogParamsControl: TCatalogParamsControl
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
  function queryProducersOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    setQueryProducers(ev.currentTarget.value);
  }

  // обработчик чекбокса
  function producerOnChange(producerId: number) {
    setCatalogParams(fp => { 
      const newProducers = fp.producers.map(
        pr => (pr.id === producerId) ? Object.assign(pr, {checked: !pr.checked}) : pr
      );
      return ({...fp, producers: newProducers})
    });
  }

  const [expanded, setExpanded] = React.useState(false);

  function expandedToogleOnClick() {
    setExpanded(expanded => !expanded);
  }

  let producersList = catalogParams.producers
    .filter(pr => (pr.checked || producerIds.includes(pr.id)));

  producersList.sort(
    (x, y) => compare(y.checked, x.checked)
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
      className={['toggle-link toggle-link--expander', 
        expanded ? '--expanded' : ''].join(' ')} 
      onClick={expandedToogleOnClick}>
      {expanded ? 'Свернуть' : 'Показать все'}
    </span>
    </>
  );
}

/**************************/
// подфильтр по категориям
interface TFilterCategoriesProps {
  catalogParamsControl: TCatalogParamsControl
}

function FilterCategories(props: TFilterCategoriesProps) {
  
  const [catalogParams, setCatalogParams] = props.catalogParamsControl;
  
  // обработчик чекбокса
  function categoryOnChange(categoryId: number) {
    setCatalogParams(fp => { 
      const newCategories = fp.categories.map(
        ct => (ct.id == categoryId) ? Object.assign(ct, {checked: !ct.checked}) : ct
      );
      return ({...fp, categories: newCategories})
    });
  }

  const [expanded, setExpanded] = React.useState(false);

  function expandedToogleOnClick() {
    setExpanded(expanded => !expanded);
  }

  let cateroriesList = [...catalogParams.categories];
  
  if (!expanded) {
    cateroriesList.sort(
      (x, y) => compare(y.checked, x.checked)
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
      className={['toggle-link toggle-link--expander', 
        expanded ? '--expanded' : ''].join(' ')} 
      onClick={expandedToogleOnClick}>
      {expanded ? 'Свернуть' : 'Показать все'}
    </span>
    </>
  );
}

/**************************/
// подфильтр по категориям
interface THotCategoriesProps {
  catalogParamsControl: TCatalogParamsControl
}

function HotCategories(props: THotCategoriesProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  // обработчик чекбокса
  function categoryOnChange(categoryId: number) {
    setCatalogParams(cp => { 
      const categories = cp.categories.map(
        ct => (ct.id == categoryId) ? Object.assign(ct, {checked: !ct.checked}) : ct
      );
      return ({...cp, 
        categories: categories, 
        updateResultFlag: true,
        resetPageFlag: true
      })
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

// блок выбора сортировки 
interface TCatalogSortProps {
  catalogParamsControl: TCatalogParamsControl
}

function CatalogSort(props: TCatalogSortProps) {

  const [catalogParams, setCatalogParams] = props.catalogParamsControl;

  function sortOnChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    ev.preventDefault();
    if (ev.target.value) {
      setCatalogParams(cp => ({...cp, 
        sort: ev.target.value,
        updateResultFlag: true,
        resetPageFlag: true
      }));
    }
  }

  return (
    <>
    {'Сортировать: '}
    <select value={catalogParams.sort} onChange={sortOnChange}>
      {
        sortTypes.map(st => 
          <option key={st} value={st}>{sortTypeTexts[st]}</option>
        )
      }
    </select>
    </>
  );
}

// параметры фильтра в строку параметров
function catalogParamsHashQuery(catalogParams: TCatalogParams) {
  let query = new URLSearchParams();
  
  //цена
  if (catalogParams.priceFr !== defaultPriceFr) {
    query.append('priceFr', catalogParams.priceFr.toString());
  }

  if (catalogParams.priceTo !== defaultPriceTo) {
    query.append('priceTo', catalogParams.priceTo.toString());
  }
  
  //производители
  const producerIdsStr = catalogParams.producers
    .filter(pr => pr.checked)
    .map(pr => pr.id.toString())
    .join('_');

  if (producerIdsStr !== '') {
    query.append('producerIds', producerIdsStr);
  }
  
  //категории
  const categoryIdsStr = catalogParams.categories
    .filter(ct => ct.checked)
    .map(ct => ct.id.toString())
    .join('_');
  
  if (categoryIdsStr !== '') {
    query.append('categoryIds', categoryIdsStr);
  }

  // сортировка
  if (catalogParams.sort !== defaultSort) {
    query.append('sort', catalogParams.sort);
  }

  return query;
}

/**********/

// получение списка продкутов с "сервера"
async function fetchProducts(catalogParams: TCatalogParams, page: number = 1) {
  console.log('call fetchProducts');

  const perPage = 6;
  page = Math.max(1, page);

  const producerTitles = catalogParams.producers
    .filter(pr => pr.checked)
    .map(pr => pr.title);

  const categoryTitles = catalogParams.categories
    .filter(ct => ct.checked)
    .map(ct => ct.title);

  // функция для сортировки результатов
  let sortCompareFn: (prX: TProduct, prY: TProduct) => number;
  switch (catalogParams.sort) {

    case 'price_DESC': {
      sortCompareFn = 
        (prX: TProduct, prY: TProduct) => -compare(prX.price, prY.price);
    } break;

    case 'title': {
      sortCompareFn = 
        (prX: TProduct, prY: TProduct) => compare(prX.title, prY.title);
    } break;

    case 'title_DESC': {
      sortCompareFn = 
        (prX: TProduct, prY: TProduct) => -compare(prX.title, prY.title);
    } break;

    //'price'
    default: {
      sortCompareFn = 
        (prX: TProduct, prY: TProduct) => compare(prX.price, prY.price);
    } break;
  }

  const productsAll: TProduct[] = 
    JSON.parse(String(localStorage.getItem('products'))) ?? [];
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
    })
    .sort(sortCompareFn); // сортировка результатов
  
  const indexFrom = perPage*(page - 1);
  const indexTo = indexFrom + perPage;
  return {
    products: products.slice(indexFrom, indexTo),
    totalPages: Math.ceil(products.length / perPage),
  };
}

// получение списка производителей с "сервера"
async function fetchProducers(query: string = '') {
  console.log('call fetchProducers');
  query = query.trim();
  const producersAll: TProducer[] = 
    (JSON.parse(String(localStorage.getItem('producers'))) ?? []);
  const producers = producersAll.filter(x =>
    x.title.toLowerCase().includes(query.toLowerCase())
  )
  .sort(
    (x, y) => compare(x.title, y.title) 
  );
  return producers;
}

// получение списка категорий с "сервера"
async function fetchCategories() {
  console.log('call fetchCategories');
  const categoriesAll: TCategory[] = 
    (JSON.parse(String(localStorage.getItem('categories'))) ?? [])
  const categories = categoriesAll.sort(
    (x, y) => compare(x.title, y.title) 
  );
  return categories;
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