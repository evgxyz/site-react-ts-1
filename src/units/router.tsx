
import React from 'react';
import {
  TStateControl0, TStateControl, 
  useContextStateControl
} from './stateControl'

export interface THashParams {
  [key: string]: string
}

export interface TRouter {
  hashHead: string,
  hashParams: THashParams,
};

type TRouterControl0 = TStateControl0<TRouter>;
type TRouterControl = TStateControl<TRouter>;

const defaultRouter: TRouter = {
  hashHead: '',
  hashParams: {},
};

const defaultRouterControl: TRouterControl0 = [
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
  setRouter(router => ({...router, 
    hashHead: initHashHead,
    hashParams: initHashParams
  }));

  window.addEventListener('hashchange', ev => {
    const newHash = (new URL(ev.newURL)).hash;
    const oldHash = (new URL(ev.oldURL)).hash;

    const regex = /^#?$|^#!/;
    if (regex.test(newHash) || regex.test(oldHash)) {
      const [newHashHead, newHashParams] = parseHash(newHash)
      setRouter(router => ({...router, 
        hashHead: newHashHead,
        hashParams: newHashParams
      }));
    }
  });
}

// парсинг фрагмента
function parseHash(hash: string) {
  console.log('call parseHash')

  let hashHead = '';
  let hashParams: THashParams = {};

  const matches = hash.match(/^(#![\w-]+)(?:\?(.+))?/i);

  if (matches) { 
    hashHead = matches[1];
    
    if (matches[2]) {
      const query = new URLSearchParams(matches[2]);
      hashParams = Object.fromEntries(query.entries());
    }
  }

  return [
    hashHead,
    hashParams
  ] as [string, THashParams]
}

