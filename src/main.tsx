import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { EhrProvider } from './store/EhrStore';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <EhrProvider>
        <App />
      </EhrProvider>
    </BrowserRouter>
  </StrictMode>,
);
