
import React from 'react';

export interface TPageHeaderProps {
  basketTray: JSX.Element,
}

export function Header(props: TPageHeaderProps) {
  return (
    <header className='header'>
      <div className='header__content'>
        <div className='header__left'>Logo</div>
        <div className='header__right'>
          {props.basketTray}
        </div>
      </div>
    </header>
  );
}
