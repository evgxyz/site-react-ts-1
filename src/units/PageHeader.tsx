
import React from 'react';

export interface TPageHeaderProps {
  basketTray: JSX.Element,
}

export function PageHeader(props: TPageHeaderProps) {
  return (
    <header className='header'>
      <div className='header__content'>
        <div className='heater__left'>Logo</div>
        <div className='heater__right'>
          {props.basketTray}
        </div>
      </div>
    </header>
  );
}
