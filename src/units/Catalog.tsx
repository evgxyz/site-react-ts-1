
import React from 'react';
import {TBasketControl} from './Basket'
import {ProductCard} from './Product'

export interface TCatalogProps {
  basketControl: TBasketControl
}

export function Catalog(props: TCatalogProps) {
  return (
    <>
      <div>
        <ProductCard basketControl={props.basketControl} />
      </div>
    </>
  );
}
