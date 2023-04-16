
import React from 'react';
import {useEnvControl} from './Env';

export function MainPage() {

  const [ , setEnv] = useEnvControl();

  React.useEffect(() => {
    setEnv(env => ({...env, 
      title: 'Корзина',
      navline: []
    }))
  }, []);

  return (
    <div className='main-page'>
      <h1 className='main-page__title'>Главная</h1>
      <div className='main-page__content'>
        <div><a href="#!catalog">Каталог</a></div>
        <div><a href="#!basket">Корзина</a></div>
        <div><a href="#!adminka">Админка</a></div>
      </div>
    </div>
  );
}
