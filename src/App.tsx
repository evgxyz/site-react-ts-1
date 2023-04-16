
import React from 'react';
import {useRouterControl, initRouter} from './units/Router';
import {MainMenu} from './units/MainMenu'
import {Header} from './units/Header'
import {Navline} from './units/Navline'
import {MainPage} from './units/MainPage'
import {useBasketReducer, initBasket, Basket, BasketTray} from './units/Basket'
import {Catalog} from './units/Catalog'
import {ProductPage} from './units/Products'
import {Adminka} from './units/Adminka'

export function App() {

  const [router, setRouter] = useRouterControl();
  const basketControl = useBasketReducer();

  React.useEffect(() => {initRouter([router, setRouter])}, []);
  React.useEffect(() => {initBasket(basketControl)}, []);

  let pageContent: JSX.Element = <></>;
  switch (router.hashHead) {
    case '#!catalog': {
      pageContent = <Catalog basketControl={basketControl} />
    } 
    break;
    case '#!product': {
      pageContent = <ProductPage basketControl={basketControl} />
    } 
    break;
    case '#!basket': {
      pageContent = <Basket basketControl={basketControl} />
    } 
    break;
    case '#!adminka': {
      pageContent = <Adminka />
    } 
    break;
    default: {
      pageContent = <MainPage />
    }
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

