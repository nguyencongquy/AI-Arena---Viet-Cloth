import React from 'react';
import ReactDOM from 'react-dom/client';
import { AvatarLabApp } from './AvatarLabApp';
import '../index.css';

const rootElement = document.getElementById('avatar-lab-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AvatarLabApp />
    </React.StrictMode>
  );
}
