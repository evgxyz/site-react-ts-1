
import React from 'react';
import {useEnvControl} from './Env';
import {TProduct, fetchProductsAll, deleteProduct} from './Products';

interface TAdmProducts {
  products: TProduct[],
  initFlag: boolean,
}

export enum AdmProductsActionType { 
  INIT = 'INIT',
  ADD = 'ADD', 
  EDIT = 'EDIT', 
  DEL = 'DEL',
}

export interface TAdmProductsAction {
  type: AdmProductsActionType,
  args?: any
}

type TAdmProductsCallbacks = {
  [funcname: string]: (arg?: any) => any
}

const defaultAdmProducts: TAdmProducts = {
  products: [],
  initFlag: false,
}

function admProductsReducer(admProducts: TAdmProducts, action: TAdmProductsAction) {
  
  switch (action.type) {

    case AdmProductsActionType.INIT: {
      const products = action.args as TProduct[];
      return {...admProducts, 
        products: products,
        initFlag: true
      };
    }

    case AdmProductsActionType.DEL: {
      const productId = action.args as number;
      const products = admProducts.products;
      const index = admProducts.products.findIndex(pr => pr.id === productId);
      if (index >= 0) {
        products.splice(index, 1);
        return {...admProducts, 
          products: products
        };
      }
      else {
        return admProducts
      }
    }

    case AdmProductsActionType.ADD: {
      const product = action.args as TProduct;
      return admProducts;
    }

    default:
      return admProducts;
  }
}

export function Adminka() {

  const [ , setEnv] = useEnvControl();
  const [admProducts, admProductsDispatch] = 
    React.useReducer(admProductsReducer, defaultAdmProducts);

  async function updateAdmProducts() {
    const products = await fetchProductsAll();
    admProductsDispatch({type: AdmProductsActionType.INIT, args: products})
  }

  React.useEffect(() => {
    setEnv(env => ({...env, 
      title: 'Админка',
      navline: ['Админка']
    }))
  }, []);

  React.useEffect(() => {
    updateAdmProducts();
  }, []);

  // колбэк удаления продукта для меню
  const delProduct = React.useCallback(async function (productId: number) {
    // удаление на "сервере" с задержкой
    const resOk = await deleteProduct(productId);
    if (resOk) {
      admProductsDispatch({type: AdmProductsActionType.DEL, args: productId})
      return true;
    } else {
      return false;
    }
  }, [admProducts.products])

  const admProductsCallbacks: TAdmProductsCallbacks = {
    delProduct: delProduct
  }

  return (
    <div className='adminka'>
      <h1 className='adminka__title'>Админка</h1>
      <div className='adminka__content'>
        {
          admProducts.initFlag ? 
            <div className='adm-products'>
              <div className='adm-products__info'>
                Всего товаров: {admProducts.products.length}
              </div> 
              <div className='adm-products__list'>
                {
                  admProducts.products.map(product => (
                    <AdmProductsItem 
                      key={product.id} 
                      product={product} 
                      admProductsCallbacks={admProductsCallbacks}
                    />
                  ))
                }
              </div>
            </div>
          : <div className='adm-products__msg'>
              <b>Загрузка...</b>
            </div>
        }
      </div>
    </div>
  );
}

// карточка продукта в админке
export interface TAdmProductsItemProps {
  product: TProduct,
  admProductsCallbacks: TAdmProductsCallbacks
}

export function AdmProductsItem(props: TAdmProductsItemProps) {

  const product = props.product;

  return (
    <div className='adm-products-item'>
      <div className='adm-products-item__body'>
        <div className='adm-products-item__id'>
          id: {product.id}
        </div>
        <div className='adm-products-item__title'>
          <a href={`#!product?id=${product.id}`}>
            {product.title}
          </a>
        </div>
        <div className='adm-products-item__description'>
          {product.description}
        </div>
        <div className='adm-products-item__price'>
          Цена: {product.price} ₽
        </div>
        <div className='adm-products-item__producer'>
          Производитель: {product.producer}
        </div>
        <div className='adm-products-item__code'>
          Штрихкод: {product.code}
        </div>
        <div className='adm-products-item__categories'>
          Категории: {product.categories.join(', ')}
        </div>
      </div>
      <div className='adm-products-item__menu'>
        <AdmProductsItemMenu 
          productId={product.id}
          admProductsCallbacks={props.admProductsCallbacks}
        />
      </div>
    </div>
  );
}

// меню продукта в админке
export interface TAdmProductsItemMenuProps {
  productId: number,
  admProductsCallbacks: TAdmProductsCallbacks
}

export function AdmProductsItemMenu(props: TAdmProductsItemMenuProps) {

  const productId = props.productId;
  const {delProduct} = props.admProductsCallbacks;
  const [delDisabled, setDelDisabled] = React.useState(false);

  async function delProductOnClick() {
    setDelDisabled(true);
    const resOK = await delProduct(productId);
    if (!resOK) {
      setDelDisabled(false);
    }
  }

  return (
    <div className='adm-products-item-menu'>
      <div className='adm-products-item-menu__btns'>
        <button className='adm-products-item-menu__btn' 
          disabled={delDisabled}
          onClick={delProductOnClick}>x</button>
      </div>
    </div>
  )
}