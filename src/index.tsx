import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import theme from './styles/theme';
import GlobalStyle from './styles/globalStyle';

import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from './redux/reducers';
import { ThemeProvider } from 'styled-components';

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(thunkMiddleware))
);


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
