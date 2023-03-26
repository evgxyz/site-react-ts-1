import React from 'react';
import ReactDOM from 'react-dom/client';
import {App} from './App'

window.addEventListener(
  'hashchange', 
  (ev) => { 
    const newUrlHash = (new URL(ev.newURL)).hash;
    const oldUrlHash = (new URL(ev.oldURL)).hash;

    const regex = /^\#?$|^\#\!/;
    if (regex.test(newUrlHash) || regex.test(oldUrlHash)) {
      window.location.reload() 
    }
  }
);

const urlHash = window.location.hash ?? '';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App urlHash={urlHash}/>);
