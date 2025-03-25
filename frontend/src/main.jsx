import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot
import App from './App.jsx';
//import './index.css'; // Or your global styles
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS

ReactDOM.createRoot(document.getElementById('root')).render( // Use createRoot
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);