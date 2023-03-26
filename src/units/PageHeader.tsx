
import React from 'react';

export interface TPageHeaderProps {
  basketTray: JSX.Element,
}

export function PageHeader(props: TPageHeaderProps) {
  return (
    <header>
      <div className='header'>
        <div>Logo</div>
        <div>{props.basketTray}</div>
      </div>
    </header>
  );
}
