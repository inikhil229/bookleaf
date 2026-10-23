import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store, setUser, logout } from './store/index.js';
import { router } from './router.jsx';
import { api } from './lib/api.js';
import './index.css';

async function bootstrap() {
  try { const data = await api('/auth/me'); store.dispatch(setUser(data.user)); }
  catch { store.dispatch(logout()); }
  createRoot(document.getElementById('root')).render(
    <React.StrictMode><Provider store={store}><RouterProvider router={router} /></Provider></React.StrictMode>
  );
}
bootstrap();
