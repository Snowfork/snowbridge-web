import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import App from './App';
import GlobalStyle from './styles/globalStyle';
import { basic } from './styles/theme';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react'
ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={basic}>
      <GlobalStyle />
      <Suspense fallback="...">
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Suspense>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root'),
);
