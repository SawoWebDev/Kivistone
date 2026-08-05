import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import '@fontsource/red-hat-display/500.css';
import '@fontsource/red-hat-display/600.css';
import '@fontsource/red-hat-display/700.css';
import '@fontsource/red-hat-display/800.css';
import '@fontsource/onest/400.css';
import '@fontsource/onest/500.css';
import './styles/theme.css';
import './styles/base.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Icon font: not needed for first paint/LCP, so load it off the critical
// rendering path instead of blocking on it like the other CSS imports above.
import('@fortawesome/fontawesome-free/css/all.min.css');
