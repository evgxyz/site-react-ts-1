
import React, {useState, useEffect} from 'react';
import {PageHeader} from './units/PageHeader'
import {Basket, BasketTray, useBasketControl, BasketActionType, fetchBasket} from './units/Basket'
import {Catalog} from './units/Catalog'

export function App() {

  const [urlHash, setUrlHash] = useState(window.location.hash);
  const basketControl = useBasketControl();

  function initRouter() {
    window.addEventListener('hashchange', ev => {
      const newUrlHash = (new URL(ev.newURL)).hash;
      const oldUrlHash = (new URL(ev.oldURL)).hash;

      const regex = /^#?$|^#!/;
      if (regex.test(newUrlHash) || regex.test(oldUrlHash)) {
        setUrlHash(newUrlHash);
      }
    });
  }

  useEffect(() => {initRouter()}, []);

  async function initBasket() {
    const basket = await fetchBasket();
    basketControl.dispatch({type: BasketActionType.INIT, args: basket});
  }

  useEffect(() => {initBasket()}, []);

  document.title = 'Главная';
  let pageContent = (
    <div className='main-content'>
      <h1>Главная</h1>
      <div><a href="#!catalog">Каталог</a></div>
      <div><a href="#!basket">Корзина</a></div>
      <div><a href="#!admin">Админка</a></div>
    </div>
  )

  if (urlHash === '#!catalog') {
    document.title = 'Каталог';
    pageContent = <Catalog basketControl={basketControl} />
  } 
  else 
  if (urlHash === '#!basket') {
    document.title = 'Корзина';
    pageContent = <Basket basketControl={basketControl} />
  } 
  else 
  if (urlHash === '#!admin') {
    document.title = 'Админка';
    pageContent = <h1>Админка</h1>
  }

  const mainMenu = (
    <div className='main-menu'> 
      <a href="#">Главная</a> {' | '}
      <a href="#!catalog">Каталог</a> {' | '} 
      <a href="#!basket">Корзина</a> {' | '} 
      <a href="#!admin">Админка</a> 
    </div>
  );

  return (
    <div id='page-wrapper'>
      <div id='page-content'>
        {mainMenu}
        <PageHeader 
          basketTray={<BasketTray basketControl={basketControl} />} 
        />
        <main className='main'>{pageContent}</main>
        <footer className='footer'>
          <div className='footer__content'>
          footer
          </div>
        </footer>
      </div>
    </div>
  )
}

