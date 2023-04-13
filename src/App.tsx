
import React from 'react';
import {useRouterControl, initRouter} from './units/Router';
import {Header} from './units/Header'
import {Navline} from './units/Navline'
import {useBasketReducer, initBasket, Basket, BasketTray} from './units/Basket'
import {Catalog} from './units/Catalog'
import {ProductPage} from './units/Product'

export function App() {

  const [router, setRouter] = useRouterControl();
  const basketControl = useBasketReducer();

  React.useEffect(() => {initRouter([router, setRouter])}, []);
  React.useEffect(() => {initBasket(basketControl)}, []);

  document.title = 'Главная';
  let pageContent = (
    <div className='main-content'>
      <h1>Главная</h1>
      <div><a href="#!catalog">Каталог</a></div>
      <div><a href="#!basket">Корзина</a></div>
      <div><a href="#!admin">Админка</a></div>
    </div>
  )

  if (router.hashHead === '#!catalog') {
    pageContent = <Catalog basketControl={basketControl} />
  } 
  else 
  if (router.hashHead === '#!product') {
    pageContent = <ProductPage basketControl={basketControl} />
  } 
  else
  if (router.hashHead === '#!basket') {
    pageContent = <Basket basketControl={basketControl} />
  } 
  else 
  if (router.hashHead === '#!admin') {
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
        <Header 
          basketTray={<BasketTray basketControl={basketControl} />} 
        />
        <Navline />
        <main className='main'>
          {pageContent}
        </main>
        <Navline />
        <footer className='footer'>
          <div className='footer__content'>
            footer
          </div>
        </footer>
      </div>
    </div>
  )
}

