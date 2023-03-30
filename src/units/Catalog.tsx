
import React, {useState, useEffect, useRef, useReducer} from 'react';
import {isIntStr, mergeObjects} from './utils';
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

  const [filterParams, setFilterParams] = useState(defaultFilterParams as TFilterParams);
  // const filterParamsControl = useReducer((filterParams, action) => {
  //   switch (action.type) {
  //     case 
  //     default:
  //       return filterParams;
  //   }
  // }, 
  // defaultFilterParams as TFilterParams);
  
  const [categoriesAll, setCategoriesAll] = useState([] as TCategory[]);

  async function updateCategoriesAll() {
    const newCategoriesAll = await fetchCategories();
    setCategoriesAll(newCategoriesAll);
  }

  useEffect(() => {updateCategoriesAll()}, []);

  return (
    <div className='catalog'>
      <pre>{JSON.stringify(filterParams)}</pre>
      {/* <div className='catalog__categories'>
        <ProductCategories 
          filterParamsControl={[filterParams, setFilterParams]}
          categoriesAll={categoriesAll} 
        />
      </div> */}
      <div className='catalog__filter'>
        <ProductFilter 
          updateProductList={updateProductList}
          filterParamsControl={[filterParams, setFilterParams]} 
          categoriesAll={categoriesAll}
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
interface TProductFilterProps {
  updateProductList: () => void,
  filterParamsControl: [TFilterParams, React.Dispatch<React.SetStateAction<TFilterParams>>],
  categoriesAll: TCategory[],
}

function ProductFilter(props: TProductFilterProps) {

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
      setFilterParams(fp => mergeObjects(fp, {priceFr: price}));
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
      setFilterParams(fp => mergeObjects(fp, {priceTo: price}));
    }
  }

  // отправить форму
  function filterFormSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    props.updateProductList();
  }

  return (
    <form className='filter__form' onSubmit={filterFormSubmit}>
      <pre>{JSON.stringify(filterParams)}</pre>
      <fieldset className='filter__price'>
        <legend>Цена</legend>
        <input type='text' value={priceFr} onChange={priceFrOnChange} />
        <input type='text' value={priceTo} onChange={priceToOnChange} />
      </fieldset>
      {/* <fieldset ref={filterProducersRef} className='filter__producers'>
        <legend>Производитель</legend>
        <FilterProducers />
      </fieldset>
      <fieldset ref={filterCategoriesRef} className='filter__categories'>
        <legend>Категории</legend>
        <FilterCategories 
          filterParamsControl={[filterParams, setFilterParams]}
          categoriesAll={props.categoriesAll} 
        />
      </fieldset> */}
      <button type='submit'>Показать</button>
    </form>
  );
}

// /**************************/
// // подфильтр по производителю
// function FilterProducers() {
  
//   const [producers, setProducers] = useState([] as TProducer[]);
//   const [producerQuery, setProducerQuery] = useState('');

//   // получение списка производителей 
//   async function updateProducers() {
//     const newProducers = await fetchProducers(producerQuery);
//     setProducers(newProducers);
//   }

//   // при первом рендере
//   useEffect(() => {updateProducers()}, []);

//   // поиск производителей
//   function producerQuerySubmit(ev: React.SyntheticEvent) {
//     ev.preventDefault();
//     updateProducers();
//   }

//   // обработчик поля ввода
//   function producerQueryOnChange(ev: React.FormEvent<HTMLInputElement>) {
//     setProducerQuery(ev.currentTarget.value);
//   }

//   return (
//     <>
//       <div>
//         <input type='text' value={producerQuery} onChange={producerQueryOnChange} />
//         <button onClick={producerQuerySubmit}>Найти</button>
//       </div>
//       <ul className='filter__producers-list'>
//         { 
//           producers.map(producer => {
//             return (
//               <li key={producer.id}>
//                 <label>
//                   <input type='checkbox' name='producer' data-title={producer.title} />
//                     {producer.title}
//                   </label>
//               </li>
//             );
//           })
//         }
//       </ul>
//     </>
//   );
// }

// /**************************/
// // подфильтр по категориям
// interface TFilterCategoriesProps {
//   filterParamsControl: [TFilterParams, (v: TFilterParams) => void],
//   categoriesAll: TCategory[],
// }

// function FilterCategories(props: TFilterCategoriesProps) {
  
//   const [filterParams, ] = props.filterParamsControl;

//   const [categories, setCategories] = useState([] as (TCategory & {checked: boolean})[]);

//   useEffect(() => {
//     setCategories(
//       props.categoriesAll.map(cat => ({
//         id: cat.id, 
//         title: cat.title, 
//         checked: false
//       }))
//     )
//   }, [props.categoriesAll]);

//   function categoryOnChange(title: string) {
//     setCategories(
//       cats => cats.map(cat => ((cat.title == title) ? {...cat, checked: !cat.checked} : cat))
//     );
//   }

//   useEffect(() => {
//     setCategories(cats => 
//       cats.map(
//         cat => ((filterParams.categories.includes(cat.title)) ? {...cat, checked: !cat.checked} : cat)
//       )
//     );
//   }, [filterParams]);

//   return (
//     <>
//     {JSON.stringify(categories)}
//     <ul className='filter__categories-list'>
//       { 
//         categories.map(category => {
//           return (
//             <li key={category.id}>
//               <label>
//                 <input type='checkbox' name='category' 
//                   data-title={category.title} 
//                   checked={category.checked}
//                   onChange={() => {categoryOnChange(category.title)}}
//                 />
//                 {category.title}
//               </label>
//             </li>
//           );
//         })
//       }
//     </ul>
//     </>
//   );
// }

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