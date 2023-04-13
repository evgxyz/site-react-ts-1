
import React from 'react';
import {useEnvControl, TNavlineItem} from './Env';

export function Navline() {

  const [env, ] = useEnvControl();

  const navline: TNavlineItem[] = [<a href=''>Главная</a>];
  for (let el of env.navline) {
    navline.push(' / ');
    navline.push(el);
  }

  return (
    <nav className='navline'>
      {navline}
    </nav>
  );
}
