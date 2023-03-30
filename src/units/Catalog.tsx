
import React, {useState, useEffect} from 'react';
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

  async function updateProductList() {
    const newProductList = await fetchProducts(filterParams);
    setProductList(newProductList);
  }

  const [filterParams, setFilterParams] = useState(defaultFilterParams);
  
  async function initFilterParams() {
    // производитель
    const producersAll = await fetchProducers();
    const newProducers = producersAll.map(pr => mergeObj(pr, {checked: false}));

    // производитель
    const categoriesAll = await fetchCategories();
    const newCategories = categoriesAll.map(ct => mergeObj(ct, {checked: false}));

    setFilterParams(fp => mergeObj(fp, {
      producers: newProducers,
      categories: newCategories,
    }));
  }

  useEffect(() => {initFilterParams()}, []);

  return (
    <div className='catalog'>
      <pre>{'filterParams:\n' + JSON.stringify(filterParams, null, 2)}</pre>
      {/* <div className='catalog__categories'>
        <ProductCategories 
          filterParamsControl={[filterParams, setFilterParams]}
          categoriesAll={categoriesAll} 
        />
      </div> */}
      <div className='catalog__filter'>
        <Filter 
          updateProductList={updateProductList}
          filterParamsControl={[filterParams, setFilterParams]} 
        />
      </div>
      <div className='catalog__product-list'>
        { 
          productList.map((product) => 
            <ProductCard 
              key={product.id} 
              product={product} 
              basketControl={props.basketControl} 
            />
          )
        }
      </div>
    </div>
  );
}

/**************************/
// фильтр основной
interface TFilterProps {
  updateProductList: () => void,
  filterParamsControl: [
    TFilterParams, 
    React.Dispatch<React.SetStateAction<TFilterParams>>
  ],
}

function Filter(props: TFilterProps) {

  // отправить форму
  function filterFormSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    props.updateProductList();
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
      <input type='text' value={priceFr} onChange={priceFrOnChange} />
      <input type='text' value={priceTo} onChange={priceToOnChange} />
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
  async function updateProducerIds() {
    const producers = await fetchProducers(queryProducers);
    const newProducerIds = producers.map(pr => pr.id);
    setProducerIds(newProducerIds);
  }

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
        pr => (pr.id == producerId) ? addObj(pr, {checked: !pr.checked}) : pr
      );
      return mergeObj(fp, {producers: newProducers})
    });
  }

  return (
    <>
      <pre>{JSON.stringify(producerIds)}</pre>
      <pre>{JSON.stringify(queryProducers)}</pre>
      <div>
        <input type='text' value={queryProducers} onChange={queryProducersOnChange} />
      </div>
      <ul className='filter__producers-list'>
        { 
          filterParams.producers
            .filter(producer => (producer.checked || producerIds.includes(producer.id)))
            .map(producer => {
              return (
                <li key={producer.id}>
                  <label>
                    <input type='checkbox' 
                      data-producer-id={producer.id} 
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

  return (
    <ul className='filter__categories-list'>
      { 
        filterParams.categories
          .map(category => {
            return (
              <li key={category.id}>
                <label>
                  <input type='checkbox' 
                    data-category-id={category.id} 
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
  );
}

// /**************************/
// // подфильтр по категориям
// interface TProductCategoriesProps {
//   filterParamsControl: [TFilterParams, (v: TFilterParams) => void],
//   categoriesAll: TCategory[],
// }

// function ProductCategories(props: TProductCategoriesProps) {

//   const [filterParams, setFilterParams] = props.filterParamsControl;

//   return (
//     <ul className='filter__categories-list'>
//       { 
//         props.categoriesAll.map(category => {
//           return (
//             <li key={category.id}>
//               <label>
//                 <input type='checkbox' name='category' 
//                   data-title={category.title} 
//                   //checked={filterParams.categories.includes(category.title)}
//                 />
//                 {category.title}
//               </label>
//             </li>
//           );
//         })
//       }
//     </ul>
//   );
// }

/**************************/

// получение списка продкутов с "сервера"
async function fetchProducts(filterParams: TFilterParams) {

  const producerTitles = filterParams.categories
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
  const producers = producersAll.filter(producer =>
    producer.title.toLowerCase().includes(query.toLowerCase())
  );
  return producers;
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