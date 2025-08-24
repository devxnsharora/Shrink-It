// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { Provider } from 'react-redux';
import axios from 'axios';

import App from './App.jsx';
import { store } from './store.js';
import './index.css';

// Set the default base URL for all API requests
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://shrink-it-backend.onrender.com' //  LIVE RENDER URL
  : 'http://localhost:5001';                     //  local backend URL

axios.defaults.baseURL = API_BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The Redux Provider gives the app access to the global state store */}
    <Provider store={store}>
      {/* The BrowserRouter provides routing capabilities to the entire app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);