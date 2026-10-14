import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import './i18n';
import { installAuthTransport } from './auth/session';
import SkeletonLoading from './components/ui/Skeleton.jsx';

installAuthTransport();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Suspense fallback={<SkeletonLoading variant="cards" label="กำลังโหลดหน้าเว็บ..." className="mx-auto max-w-6xl p-6" />}>
        <App />
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>,
);
