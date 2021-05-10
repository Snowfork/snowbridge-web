import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import App from './App';
import GlobalStyle from './styles/globalStyle';
import theme from './styles/theme';
import store from './redux/store';

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Suspense fallback="...">
        <App />
      </Suspense>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root'),
);
