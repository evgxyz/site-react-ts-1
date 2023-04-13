
import React from 'react';
import {useEnvControl} from './Env';

export function Navline() {

  const [env, ] = useEnvControl();

  return (
    <nav className='navline'>
      {'Главная / ' + env.navline}
    </nav>
  );
}
