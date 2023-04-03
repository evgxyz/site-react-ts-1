
import React from 'react';
import {
  TContextInitStateControl, 
  TContextStateControl, 
  useContextStateControl
} from './contextStateControl'

interface THashParams {
  [key: string]: string
}

interface TRouter {
  hashHead: string,
  hashParams: THashParams,
};

type TInitRouterControl = TContextInitStateControl<TRouter>;
type TRouterControl = TContextStateControl<TRouter>;

const defaultRouter: TRouter = {
  hashHead: '',
  hashParams: {}
};

const defaultRouterControl: TInitRouterControl = [
  defaultRouter,
  undefined,
];

const RouterContext = React.createContext(defaultRouterControl);

export function useRouterControl() {
  return useContextStateControl<TRouter>(RouterContext);
}

interface TRouterProviderProps {
  children: React.ReactNode,
}

export function RouterProvider(props: TRouterProviderProps) {
  
  const [router, setRouter] = React.useState(defaultRouter);
  
  return (
    <RouterContext.Provider value={[router, setRouter]}>
      {props.children}
    </RouterContext.Provider>
  )
}

export function initRouter(routerControl: TRouterControl) { 

  const [ , setRouter] = routerControl;

  const [initHashHead, initHashParams] = parseHash(window.location.hash);
  setRouter(router => ({
    ...router, 
    hashHead: initHashHead,
    hashParams: initHashParams
  }));

  window.addEventListener('hashchange', ev => {
    const newHash = (new URL(ev.newURL)).hash;
    const oldHash = (new URL(ev.oldURL)).hash;

    const regex = /^#?$|^#!/;
    if (regex.test(newHash) || regex.test(oldHash)) {
      const [newHashHead, newHashParams] = parseHash(newHash)
      setRouter(router => ({
        ...router, 
        hashHead: newHashHead,
        hashParams: newHashParams
      }));
    }
  });
}

function parseHash(hash: string) {

  console.log('call parseHash')

  let hashHead = '';
  let hashParams = {} as THashParams;

  const matches = hash.match(/^(#![\w-]+)(?:\?([&=\w]+))?/i);

  if (matches) { 
    hashHead = matches[1];
    
    if (matches[2]) {
      matches[2].split('&')
        .forEach(s => {
          const [key, val = ''] = s.split('=').map(x => x.trim());
          if (key) {
            hashParams[key] = val;
          }
        });
    }
  }

  return [
    hashHead,
    hashParams
  ] as [string, THashParams]
}

