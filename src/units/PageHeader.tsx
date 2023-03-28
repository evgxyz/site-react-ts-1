
import React from 'react';

export interface TPageHeaderProps {
  basketTray: JSX.Element,
}

export function PageHeader(props: TPageHeaderProps) {
  return (
    <header className='header'>
      <div className='header__content'>
        <div>Logo</div>
        <div>{props.basketTray}</div>
      </div>
    </header>
  );
}
