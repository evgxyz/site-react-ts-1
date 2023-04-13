
import React from 'react';
import {
  TStateControl0, TStateControl, 
  useContextStateControl
} from './stateControl'

export interface TEnv {
  title: string,
  navline: string,
};

type TEnvControl0 = TStateControl0<TEnv>;
type TEnvControl = TStateControl<TEnv>;

const defaultEnv: TEnv = {
  title: '',
  navline: ''
};

const defaultEnvControl: TEnvControl0 = [
  defaultEnv,
  undefined,
];

const EnvContext = React.createContext(defaultEnvControl);

export function useEnvControl() {
  return useContextStateControl<TEnv>(EnvContext);
}

interface TEnvProviderProps {
  children: React.ReactNode,
}

export function EnvProvider(props: TEnvProviderProps) {
  
  const [env, setEnv] = React.useState(defaultEnv);

  React.useEffect(() => {
    document.title = env.title;
  }, [env.title]);
  
  return (
    <EnvContext.Provider value={[env, setEnv]}>
      {props.children}
    </EnvContext.Provider>
  )
}