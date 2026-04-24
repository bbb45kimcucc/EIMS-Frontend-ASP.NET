import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios'; // Chỉ cần một dòng này thôi nè
import reportWebVitals from './reportWebVitals';

axios.defaults.withCredentials = true;

axios.defaults.baseURL = process.env.REACT_APP_API_URL || "https://localhost:7033";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();