
import React from 'react';
import ReactDOM from 'react-dom/client';

import {EnvProvider} from './units/Env';
import {RouterProvider} from './units/Router';
import {App} from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <EnvProvider>
  <RouterProvider>
    <App />
  </RouterProvider>
  </EnvProvider>
);
