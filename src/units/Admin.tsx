
import React from 'react';
import {useEnvControl} from './Env';
import {TProduct, fetchProductsAll} from './Products';

interface TAdminState {
  products: TProduct[],
  initFlag: boolean,
}

const defaultAdminState: TAdminState = {
  products: [],
  initFlag: false,
}

export function Admin() {

  const [ , setEnv] = useEnvControl();
  const [adminState, setAdminState] = React.useState(defaultAdminState);

  async function updateAdminState() {
    const products = await fetchProductsAll();
    setTimeout(() => {
      setAdminState(st => ({...st,
        products: products,
        initFlag: true
      }));
    }, 500);
  }

  React.useEffect(() => {
    setEnv(env => ({...env, 
      title: 'Админка',
      navline: ['Админка']
    }))
  }, []);

  React.useEffect(() => {
    updateAdminState();
  }, []);

  return (
    <div className='admin'>
      <h1 className='admin__title'>Админка</h1>
      <div className='admin__content'>
        <div className='admin-products__info'>
          Всего товаров: {adminState.products.length}
        </div> 
        <div className='admin-products__item-list'>
          {
            adminState.products.map(product => (
              <AdminProductsItem 
                key={product.id} 
                product={product} 
                /* basketControl={props.basketControl}  */
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

// карточка продукта в корзине
export interface TAdminProductsItemProps {
  product: TProduct,
}

export function AdminProductsItem(props: TAdminProductsItemProps) {

  const product = props.product;

  return (
    <div className='admin-products-item'>
      <div className='admin-products-item__body'>
        <div className='admin-products-item__title'>
          <a href={`#!product?id=${product.id}`}>
            {product.title}
          </a>
        </div>
        <div className='admin-products-item__price'>
          Цена: {product.price} ₽
        </div>
        <div className='admin-products-item__producer'>
          Производитель: {product.producer}
        </div>
        <div className='admin-products-item__code'>
          Штрихкод: {product.code}
        </div>
      </div>
      <div className='admin-products-item__menu'>
        Меню
      </div>
    </div>
  );
}