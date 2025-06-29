import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './data/AuthContext.jsx';
import { FinanceProvider } from './data/FinanceContext.jsx';
import { ThemeProvider } from './data/ThemeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FinanceProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </FinanceProvider>
    </AuthProvider>
  </React.StrictMode>,
)
