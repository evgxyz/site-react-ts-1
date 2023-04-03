
import React from 'react';
import {TContextStateControl, useContextStateControl} from './context'

interface TRouter {
  location: string
};

const defaultRouter = {
  location: ''
};

const defaultContextStateControl: TContextStateControl<TRouter> = [
  defaultRouter,
  undefined
]

const RouterContext = React.createContext(defaultContextStateControl);

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

