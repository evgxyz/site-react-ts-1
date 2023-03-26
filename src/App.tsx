
import React from 'react';
import {PageHeader} from './units/PageHeader'
import {BasketTray, useBasketControl} from './units/Basket'
import {Catalog} from './units/Catalog'

export interface TAppProps {
  urlHash: string
}

export function App(props: TAppProps) {

  const basketControl = useBasketControl();

  let pageContent = (
    <>
      <h1>Main page</h1>
      <div><a href="#!catalog">Каталог</a></div>
      <div><a href="#!admin">Админка</a></div>
      <div><a href="#anchor">Якорь обычный</a></div>
    </>
  )

  if (props.urlHash == '#!catalog') {
    pageContent = <Catalog basketControl={basketControl}/>
  } 
  else 
  if (props.urlHash == '#!admin') {
    pageContent = <h1>Админка</h1>
  }

  return (
    <div className='page-wrapper'>
    <PageHeader basketTray={<BasketTray basketControl={basketControl}/>}/>
    <main>{pageContent}</main>
    <footer>footer</footer>
    </div>
  )
}

