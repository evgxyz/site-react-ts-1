
import React, {useState, useEffect, useRef} from 'react';
import {useStateMerge} from './utils';
import {TBasketControl} from './Basket'
import {TProduct, TProducer, ProductCard} from './Products'
import {initProducts} from '../data/products'
import {initProducers} from '../data/producers'

interface TFilterParams {
  priceFr: number,
  priceTo: number,
  producers: string[]
}

const initFilterParams: TFilterParams = {
  priceFr: 0,
  priceTo: Infinity,
  producers: []
}

const initProductList: TProduct[] = [];

/**************************/
// каталог
export interface TCatalogProps {
  basketControl: TBasketControl
}

export function Catalog(props: TCatalogProps) {

  const [filterParams, setFilterParams] = useStateMerge(initFilterParams);
  const [productList, setProductList] = useState(initProductList);

  async function updateProductList() {
    const newProductList = await fetchProducts(filterParams);
    setProductList(newProductList);
  }

  useEffect(() => {updateProductList()}, [filterParams]);

  return (
    <div className='catalog'>
      <pre>{JSON.stringify(filterParams)}</pre>
      <div className='catalog__filter'>
        <ProductFilter filterParamsControl={[filterParams, setFilterParams]} />
      </div>
      <div className='catalog__product-list'>
        {productList.map((product) => 
          <ProductCard key={product.id} product={product} basketControl={props.basketControl} />
        )}
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
  // список производителей
  const filterProducers = useRef<HTMLDivElement>(null);

  function filterParamsSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();

    const newPriceFr = parseInt(priceFr);
    const newPriceTo = parseInt(priceTo);
    
    const newProducers = 
      Array.from(filterProducers.current?.querySelectorAll('input[name="producer"]:checked') ?? [])
      .map(el => el.getAttribute('data-title') ?? '')
      .filter(s => (s !== ''));

    setFilterParams({
      priceFr: newPriceFr,
      priceTo: newPriceTo,
      producers: newProducers,
    });
  }

  function priceFrOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setPriceFr(ev.currentTarget.value);
  }

  function priceToOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setPriceTo(ev.currentTarget.value);
  }

  return (
    <form className='filter__form' onSubmit={filterParamsSubmit}>
      <div className='filter__price'>
        <input type='text' value={priceFr} onChange={priceFrOnChange} />
        <input type='text' value={priceTo} onChange={priceToOnChange} />
      </div>
      <div ref={filterProducers} className='filter__producers'>
        <FilterProducers />
      </div>
      <button type='submit'>Показать</button>
    </form>
  );
}

/**************************/
// подфильтр производитель
function FilterProducers() {
  
  const [producers, setProducers] = useState(initProducers);
  const [producerQuery, setProducerQuery] = useState('');

  function producerQuerySubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    const newProducers = initProducers.filter(producer =>
      producer.title.toLowerCase().includes(producerQuery.toLowerCase())
    );
    setProducers(newProducers);
  }

  function producerQueryOnChange(ev: React.FormEvent<HTMLInputElement>) {
    setProducerQuery(ev.currentTarget.value);
  }

  return (
    <>
      <form onSubmit={producerQuerySubmit}>
        <input type='text' value={producerQuery} onChange={producerQueryOnChange} />
        <button onClick={producerQuerySubmit}>Найти</button>
      </form>
      <ul>
        {producers.map(producer => {
          return (
            <li key={producer.id}>
              <label>
                <input type='checkbox' name='producer' data-title={producer.title} />
                  {producer.title}
                </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**************************/

// получение списка продкутов с "сервера"
async function fetchProducts(filterParams: TFilterParams) {
  const products: TProduct[] = JSON.parse(String(localStorage.getItem('products'))) ?? [];
  const filteredProducts = products.filter(product => {
    return (
      ( product.price >= filterParams.priceFr && product.price <= filterParams.priceTo ) &&
      ( filterParams.producers.length == 0 || 
        (product.producer && filterParams.producers.includes(product.producer)) )
    );
  })
  return filteredProducts;
}

// инициализация продуктов на "сервере"
if( true || !localStorage.getItem('products') ) {
  localStorage.setItem('products', JSON.stringify(initProducts));
}