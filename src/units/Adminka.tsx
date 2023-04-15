
import React from 'react';
import {isIntStr, pickobj} from './utils';
import {useEnvControl} from './Env';
import {
    TProduct, 
    fetchProductsAll, 
    dbEditProduct, 
    dbDelProduct
} from './Products';

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
  [funcname: string]: (...arg: any[]) => Promise<any>
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

    case AdmProductsActionType.EDIT: {
      const newProduct = action.args as TProduct;
      const products = admProducts.products;
      const index = products.findIndex(pr => pr.id === newProduct.id);
      if (index >= 0) {
        products[index] = newProduct;
        return {...admProducts, 
          products: products
        };
      }
      else {
        return admProducts
      }
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

  // колбэк для редактирования продукта
  const editProduct = 
    async function (newProduct: TProduct) {  
    // редактирование на "сервере" с задержкой
    const resOk = await dbEditProduct(newProduct);
    if (resOk) {
      admProductsDispatch({
        type: AdmProductsActionType.EDIT, 
        args: newProduct
      })
      return true;
    } else {
      return false;
    }
  };

  // колбэк удаления продукта
  const delProduct = async function (productId: number) {
    // удаление на "сервере" с задержкой
    const resOk = await dbDelProduct(productId);
    if (resOk) {
      admProductsDispatch({type: AdmProductsActionType.DEL, args: productId})
      return true;
    } else {
      return false;
    }
  };

  const admProductsCallbacks: TAdmProductsCallbacks = {
    editProduct,
    delProduct
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
  const {editProduct, delProduct} = props.admProductsCallbacks;

  const [busy, setBusy] = React.useState(false);

  const [editing, setEditing] = React.useState(false);
  const [tmpProduct, setTmpProduct] = React.useState( 
    () => ({...product, priceStr: product.price.toString()})
  );

  // изменение продукта
  function toggleEditOnClick() {
    setEditing(st => !st);
    setTmpProduct({...product, priceStr: product.price.toString()})
  }

  function editProductOnSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault(); 
    console.log('call editProductOnSubmit')
    setBusy(true);
    const newProduct = 
      pickobj(tmpProduct, Object.keys(product) as (keyof TProduct)[]);
    editProduct(newProduct)
      .then(() => {setEditing(false)})
      .finally(() => setBusy(false));
  }

  function titleOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const title = ev.currentTarget.value;
    setTmpProduct(pr => ({...pr, title}));
  }

  function descrOnChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    const description = ev.currentTarget.value;
    setTmpProduct(pr => ({...pr, description}));
  }

  function priceOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const priceStr = ev.currentTarget.value.trim();
    if (priceStr == '' || isIntStr(priceStr)) {
      let price = parseInt(priceStr);
      if (!isFinite(price)) { 
        price = 0;
      }
      setTmpProduct(pr => ({...pr, price, priceStr}));
    } 
  }

  function producerOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const producer = ev.currentTarget.value;
    setTmpProduct(pr => ({...pr, producer}));
  }

  function codeOnChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const code = ev.currentTarget.value;
    setTmpProduct(pr => ({...pr, code}));
  }

  // удаление продукта
  function delProductOnClick() {
    if (!confirm('Удалить?')) return;
    setBusy(true);
    delProduct(product.id)
      .finally(() => setBusy(false));
  }

  return (
    <div className='adm-products-item'>
      {
        editing ?
        <>
          <form onSubmit={editProductOnSubmit}> 
            <table className='adm-products-item__table'>
            <tbody>
              <tr>
                <td>id:</td>
                <td><div>{product.id}</div></td>
              </tr>
              <tr>
                <td>Название:</td>
                <td><input type='text' 
                  value={tmpProduct.title} onChange={titleOnChange} /></td>
              </tr>
              <tr>
                <td>Описание:</td>
                <td>
                  <textarea 
                    value={tmpProduct.description} 
                    onChange={descrOnChange}
                    className='adm-products-item__descr-ta' />
                </td>
              </tr>
              <tr>
                <td>Цена:</td>
                <td><input type='text' 
                  value={tmpProduct.priceStr} onChange={priceOnChange} /></td>
              </tr>
              <tr>
                <td>Производитель:</td>
                <td><input type='text' 
                  value={tmpProduct.producer} onChange={producerOnChange} /></td>
              </tr>
              <tr>
                <td>Штрихкод:</td>
                <td><input type='text' 
                  value={tmpProduct.code} onChange={codeOnChange} /></td>
              </tr>
              <tr>
                <td>Категории:</td>
                <td><div>{tmpProduct.categories.join(', ')}</div></td>
              </tr>
            </tbody>
            </table>
            <div className='adm-products-item__menu'>
              <button className='adm-products-item__btn' 
                  disabled={busy}
                  onClick={toggleEditOnClick}>Отменить</button>
              <button type='submit' className='adm-products-item__btn' 
                  disabled={busy}>Сохранить</button>
            </div>
          </form>
        </>
        :
        <> 
          <table className='adm-products-item__table'>
          <tbody>
            <tr>
              <td>id:</td>
              <td><div>{product.id}</div></td>
            </tr>
            <tr>
              <td>Название:</td>
              <td><div>{product.title}</div></td>
            </tr>
            <tr>
              <td>Описание:</td>
              <td>
                <div className='adm-products-item__descr-div'>
                  {product.description}
                </div>
              </td>
            </tr>
            <tr>
              <td>Цена:</td>
              <td><div>{product.price}</div></td>
            </tr>
            <tr>
              <td>Производитель:</td>
              <td><div>{product.producer}</div></td>
            </tr>
            <tr>
              <td>Штрихкод:</td>
              <td><div>{product.code}</div></td>
            </tr>
            <tr>
              <td>Категории:</td>
              <td><div>{product.categories.join(', ')}</div></td>
            </tr>
          </tbody>
          </table>
          <div className='adm-products-item__menu'>
            <button className='adm-products-item__btn' 
                disabled={busy}
                onClick={toggleEditOnClick}>Изменить</button>
            <button className='adm-products-item__btn' 
                disabled={busy}
                onClick={delProductOnClick}>Удалить</button>
          </div>
        </>
      }
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