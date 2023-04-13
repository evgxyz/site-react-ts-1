
import React from 'react';
import {useEnvControl} from './Env';
import {TProduct, fetchProductsAll} from './Products';

interface TAdminProducts {
  products: TProduct[],
  initFlag: boolean,
}

const defaultAdminProducts: TAdminProducts = {
  products: [],
  initFlag: false,
}

export function Admin() {

  const [ , setEnv] = useEnvControl();
  const [adminProducts, setAdminProducts] = React.useState(defaultAdminProducts);

  async function updateAdminProducts() {
    const products = await fetchProductsAll();
    setTimeout(() => {
      setAdminProducts(st => ({...st,
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
    updateAdminProducts();
  }, []);

  return (
    <div className='admin'>
      <h1 className='admin__title'>Админка</h1>
      <div className='admin__content'>
        {
          adminProducts.initFlag ? 
            <div className='admin-products'>
              <div className='admin-products__info'>
                Всего товаров: {adminProducts.products.length}
              </div> 
              <div className='admin-products__list'>
                {
                  adminProducts.products.map(product => (
                    <AdminProductsItem 
                      key={product.id} 
                      product={product} 
                      /* basketControl={props.basketControl}  */
                    />
                  ))
                }
              </div>
            </div>
          : <div className='admin-products__msg'>
              <b>Загрузка...</b>
            </div>
        }
      </div>
    </div>
  );
}

// карточка продукта в админке
export interface TAdminProductsItemProps {
  product: TProduct,
}

export function AdminProductsItem(props: TAdminProductsItemProps) {

  const product = props.product;

  return (
    <div className='admin-products-item'>
      <div className='admin-products-item__body'>
        <div className='admin-products-item__id'>
          id: {product.id}
        </div>
        <div className='admin-products-item__title'>
          <a href={`#!product?id=${product.id}`}>
            {product.title}
          </a>
        </div>
        <div className='admin-products-item__description'>
          {product.description}
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
        <div className='catalog-product-card__categories'>
          Категории: {product.categories.join(', ')}
        </div>
      </div>
      <div className='admin-products-item__menu'>
        Меню
      </div>
    </div>
  );
}