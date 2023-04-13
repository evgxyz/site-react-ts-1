
import React from 'react';
import {useEnvControl} from './Env';

export function AdminPage() {

  const [ , setEnv] = useEnvControl();

  React.useEffect(() => {
    setEnv(env => ({...env, 
      title: 'Админка',
      navline: ['Админка']
    }))
  }, []);

  return (
    <div className='admin-page'>
      <h1 className='admin-page__title'>Админка</h1>
    </div>
  );
}
