import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { store } from './redux/store';
import { ThemeModeProvider } from './theme/ThemeModeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeModeProvider>
    </Provider>
  </StrictMode>
);
