
import React, { useEffect } from 'react';
import {isIntStr, pickobj, compare} from './utils';
import {useEnvControl} from './Env';
import {
    TProduct, TCategory, templateProduct,
    dbGetProducts, 
    dbGetCategories,
    dbAddProduct,
    dbEditProduct, 
    dbDelProduct
} from './Products';

interface TAdmProducts {
  products: TProduct[],
  initFlag: boolean,
}

type TTmpCategory = TCategory & {checked: boolean}
type TTmpProduct = TProduct & {priceStr: string}

enum AdmProductsActionType { 
  INIT = 'INIT',
  ADD = 'ADD', 
  EDIT = 'EDIT', 
  DEL = 'DEL',
}

interface TAdmProductsAction {
  type: AdmProductsActionType,
  args?: any
}

type TAdmProductsCallbacks = {
  addProduct: (product: TProduct) => Promise<boolean>,
  editProduct: (product: TProduct) => Promise<boolean>,
  delProduct: (productId: number) => Promise<boolean>
}

const defaultAdmProducts: TAdmProducts = {
  products: [],
  initFlag: false,
}

const defaultTmpCategories: TTmpCategory[] = [];

const defaultTmpProduct: TTmpProduct = {
  ...templateProduct,
  priceStr: ''
}

// редусер для операций со списком товаров в админке
function admProductsReducer(admProducts: TAdmProducts, action: TAdmProductsAction) {
  
  switch (action.type) {

    case AdmProductsActionType.INIT: {
      const products = action.args as TProduct[];
      return {...admProducts, 
        products: products,
        initFlag: true
      };
    }

    case AdmProductsActionType.ADD: {
      const newProduct = action.args as TProduct;
      admProducts.products.push(newProduct);
      return {...admProducts};
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

    default:
      return admProducts;
  }
}

// админка
export function Adminka() {

  const [ , setEnv] = useEnvControl();
  const [admProducts, admProductsDispatch] = 
    React.useReducer(admProductsReducer, defaultAdmProducts);

  async function updateAdmProducts() {
    const products = await dbGetProducts();
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

  // колбэк для добавления продукта
  const addProduct = 
    async function (newProduct: TProduct) {  
    // добавление на "сервере" с задержкой
    const [resOk, insertId] = await dbAddProduct(newProduct);
    if (resOk) {
      admProductsDispatch({
        type: AdmProductsActionType.ADD, 
        args: {...newProduct, id: insertId}
      });
      return true;
    } else {
      return false;
    }
  };

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

  // колбэк для удаления продукта
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
    addProduct,
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
                  admProducts.products
                    .sort((prX, prY) => compare(prX.id, prY.id))
                    .map(product => (
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
        <div className='adm-products__add-form'>
          <AddProductForm admProductsCallbacks={admProductsCallbacks} />
        </div>
      </div>
    </div>
  );
}

// карточка продукта в админке
interface TAdmProductsItemProps {
  product: TProduct,
  admProductsCallbacks: TAdmProductsCallbacks
}

function AdmProductsItem(props: TAdmProductsItemProps) {

  const product = props.product;
  const {editProduct, delProduct} = props.admProductsCallbacks;

  const [busy, setBusy] = React.useState(false);

  const [editing, setEditing] = React.useState(false);
  const [tmpCategories, setTmpCategories] = React.useState(defaultTmpCategories);
  const [tmpProduct, setTmpProduct] = React.useState( 
    () => ({...product, priceStr: product.price.toString()} as TTmpProduct)
  );

  async function initEditing() {
    const categoriesAll = await dbGetCategories();
    const tmpCategories = categoriesAll.map(ct => 
      ({...ct, checked: product.categories.includes(ct.title)})
    );
    setTmpCategories(tmpCategories);
  }

  React.useEffect(() => {
    if (editing) {
      initEditing();
    }
  }, [editing]);

  // изменение продукта
  function toggleEditOnClick() {
    setEditing(st => !st);
    setTmpProduct({...product, priceStr: product.price.toString()})
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

  function categoriesOnChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    ev.preventDefault();
    if (ev.currentTarget.selectedOptions) {
      const values = Array.from(
        ev.currentTarget.selectedOptions, 
        opt => parseInt(opt.value)
      );
      const newTmpCategories = tmpCategories.map(ct => 
        ({...ct, checked: values.includes(ct.id)})
      );
      setTmpCategories(newTmpCategories);
    }
  }

  function editProductOnSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault(); 
    console.log('call editProductOnSubmit')
    setBusy(true);
    const newProduct = 
      pickobj(tmpProduct, Object.keys(product) as (keyof TProduct)[]) as TProduct;
    const newCategories = tmpCategories.filter(ct => ct.checked).map(ct => ct.title);
    newProduct.categories = newCategories;
    editProduct(newProduct)
      .then(() => {setEditing(false)})
      .finally(() => setBusy(false));
  }

  // удаление продукта
  function delProductOnClick() {
    if (!confirm('Удалить?')) return;
    setBusy(true);
    delProduct(product.id)
      .finally(() => setBusy(false));
  }

  return (
    <div data-id={product.id} className='adm-products-item'>
      {
        editing ?
          <>
          <form onSubmit={editProductOnSubmit}> 
            <table className='product-form__table'>
            <tbody>
              <tr>
                <td>id:</td>
                <td><div>{product.id}</div></td>
              </tr>
              <tr>
                <td>Название:</td>
                <td>
                  <input type='text' 
                    value={tmpProduct.title} 
                    onChange={titleOnChange} />
                  </td>
              </tr>
              <tr>
                <td>Описание:</td>
                <td>
                  <textarea 
                    value={tmpProduct.description} 
                    onChange={descrOnChange}
                    className='product-form__descr-ta' />
                </td>
              </tr>
              <tr>
                <td>Цена:</td>
                <td>
                  <input type='text' 
                    value={tmpProduct.priceStr} 
                    onChange={priceOnChange} />
                </td>
              </tr>
              <tr>
                <td>Производитель:</td>
                <td>
                  <input type='text' 
                    value={tmpProduct.producer} 
                    onChange={producerOnChange} />
                </td>
              </tr>
              <tr>
                <td>Штрихкод:</td>
                <td>
                  <input type='text' 
                    value={tmpProduct.code} 
                    onChange={codeOnChange} />
                </td>
              </tr>
              <tr>
                <td>Категории:</td>
                <td>
                  {
                    tmpCategories.length == 0 ?
                      <span>Загрузка...</span>
                    :
                      <>
                      <div className='product-form__categories-list'>
                        {
                          tmpCategories
                            .filter(ct => ct.checked)
                            .map(ct => ct.title).join(', ')
                        }
                      </div>
                      <select multiple={true}
                        value={
                          tmpCategories
                            .filter(ct => ct.checked)
                            .map(ct => ct.id.toString())
                        } 
                        onChange={categoriesOnChange}
                      >
                        {
                          tmpCategories.map(ct => 
                            <option key={ct.id} value={ct.id.toString()}>
                              {ct.title}
                            </option>
                          )
                        }
                      </select>
                      </>
                  }
                </td>
              </tr>
            </tbody>
            </table>
            <div className='product-form__menu'>
              <button className='product-form__btn' 
                disabled={busy}
                onClick={toggleEditOnClick}>Отменить</button>
              <button type='submit' className='product-form__btn' 
                disabled={busy}>Сохранить</button>
            </div>
          </form>
          </>
        :
          <> 
            <table className='product-form__table'>
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
                  <div className='product-form__descr-div'>
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
                <td>
                  <div className='product-form__categories-list'>
                    { product.categories.sort().join(', ') }
                  </div>
                </td>
              </tr>
            </tbody>
            </table>
            <div className='product-form__menu'>
              <button className='product-form__btn' 
                  disabled={busy}
                  onClick={toggleEditOnClick}>Изменить</button>
              <button className='product-form__btn' 
                  disabled={busy}
                  onClick={delProductOnClick}>Удалить</button>
            </div>
          </>
      }
    </div>
  );
}

// форма добавления продкукта
interface TAddProductFormProps {
  admProductsCallbacks: TAdmProductsCallbacks
}

function AddProductForm(props: TAddProductFormProps) {

  const {addProduct} = props.admProductsCallbacks;

  const [busy, setBusy] = React.useState(false);
  const [tmpCategories, setTmpCategories] = React.useState(defaultTmpCategories);
  const [tmpProduct, setTmpProduct] = React.useState(defaultTmpProduct);

  async function initAddParams() {
    const categoriesAll = await dbGetCategories();
    const tmpCategories = categoriesAll.map(ct => ({...ct, checked: false}));
    setTmpCategories(tmpCategories);
  }

  async function resetAddParams() {
    setTmpProduct(defaultTmpProduct);
    setTmpCategories(cts => cts.map(ct => ({...ct, checked: false})));
  }

  useEffect(() => {initAddParams()}, []);

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

  function categoriesOnChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    ev.preventDefault();
    if (ev.currentTarget.selectedOptions) {
      const values = Array.from(
        ev.currentTarget.selectedOptions, 
        opt => parseInt(opt.value)
      );
      const newTmpCategories = tmpCategories.map(ct => 
        ({...ct, checked: values.includes(ct.id)})
      );
      setTmpCategories(newTmpCategories);
    }
  }

  function addProductOnSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault(); 
    console.log('call addProductOnSubmit')
    setBusy(true);
    const newProduct = 
      pickobj(tmpProduct, Object.keys(templateProduct) as (keyof TProduct)[]) as TProduct;
    const newCategories = tmpCategories.filter(ct => ct.checked).map(ct => ct.title);
    newProduct.categories = newCategories;
    addProduct(newProduct)
      .then(() => {resetAddParams()})
      .finally(() => setBusy(false));
  }

  return (
    <>
    <div className='product-form__title'>
      Добавление продукта
    </div>
    <form onSubmit={addProductOnSubmit}> 
      <table className='product-form__table'>
      <tbody>
        <tr>
          <td>Название:</td>
          <td>
            <input type='text' 
              value={tmpProduct.title} 
              onChange={titleOnChange} />
            </td>
        </tr>
        <tr>
          <td>Описание:</td>
          <td>
            <textarea 
              value={tmpProduct.description} 
              onChange={descrOnChange}
              className='product-form__descr-ta' />
          </td>
        </tr>
        <tr>
          <td>Цена:</td>
          <td>
            <input type='text' 
              value={tmpProduct.priceStr} 
              onChange={priceOnChange} />
          </td>
        </tr>
        <tr>
          <td>Производитель:</td>
          <td>
            <input type='text' 
              value={tmpProduct.producer} 
              onChange={producerOnChange} />
          </td>
        </tr>
        <tr>
          <td>Штрихкод:</td>
          <td>
            <input type='text' 
              value={tmpProduct.code} 
              onChange={codeOnChange} />
          </td>
        </tr>
        <tr>
          <td>Категории:</td>
          <td>
            {
              tmpCategories.length == 0 ?
                <span>Загрузка...</span>
              :
                <>
                <div className='product-form__categories-list'>
                  {
                    tmpCategories
                      .filter(ct => ct.checked)
                      .map(ct => ct.title).join(', ')
                  }
                </div>
                <select multiple={true}
                  value={
                    tmpCategories
                      .filter(ct => ct.checked)
                      .map(ct => ct.id.toString())
                  } 
                  onChange={categoriesOnChange}
                >
                  {
                    tmpCategories.map(ct => 
                      <option key={ct.id} value={ct.id.toString()}>
                        {ct.title}
                      </option>
                    )
                  }
                </select>
                </>
            }
          </td>
        </tr>
      </tbody>
      </table>
      <div className='product-form__menu'>
        <button type='submit' className='product-form__btn' 
          disabled={busy}>Добавить</button>
      </div>
    </form>
    </>
  );
}

