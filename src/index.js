import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios'; 
import reportWebVitals from './reportWebVitals'; // Đưa bạn này lên đây chơi chung nè!

// Sau khi import hết rồi mới đến lượt các dòng thực thi
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();