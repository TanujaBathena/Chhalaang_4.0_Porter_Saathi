import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <UserProvider>
        <App />
      </UserProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
