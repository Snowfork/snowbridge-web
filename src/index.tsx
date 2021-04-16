import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { ThemeProvider } from 'styled-components';
import App from './App';
import GlobalStyle from './styles/globalStyle';
import theme from './styles/theme';
import reducers from './redux/reducers';

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(thunkMiddleware)),
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
