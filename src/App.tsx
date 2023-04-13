
import React from 'react';
import {useRouterControl, initRouter} from './units/Router';
import {MainMenu} from './units/MainMenu'
import {Header} from './units/Header'
import {Navline} from './units/Navline'
import {MainPage} from './units/MainPage'
import {useBasketReducer, initBasket, Basket, BasketTray} from './units/Basket'
import {Catalog} from './units/Catalog'
import {ProductPage} from './units/Product'
import {AdminPage} from './units/AdminPage'

export function App() {

  const [router, setRouter] = useRouterControl();
  const basketControl = useBasketReducer();

  React.useEffect(() => {initRouter([router, setRouter])}, []);
  React.useEffect(() => {initBasket(basketControl)}, []);

  let pageContent: JSX.Element = <></>;
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
    pageContent = <AdminPage />
  }
  else {
    pageContent = <MainPage />
  }

  return (
    <div id='page-wrapper'>
      <div id='page-content'>
        <MainMenu />
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

