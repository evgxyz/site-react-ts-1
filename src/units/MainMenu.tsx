
import React from 'react';

export function MainMenu() {
  return (
    <div className='main-menu'> 
      <a href="#">Главная</a> {' | '}
      <a href="#!catalog">Каталог</a> {' | '} 
      <a href="#!basket">Корзина</a> {' | '} 
      <a href="#!adminka">Админка</a> 
    </div>
  );
}
