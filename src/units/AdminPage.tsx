
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
    <div className='main-page'>
      <h1>Админка</h1>
    </div>
  );
}
