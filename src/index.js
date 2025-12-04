import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import App from './App';
import './index.css';
import './styles/theme.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Web3Provider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
