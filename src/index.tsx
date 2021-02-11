import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import Theme from './styles/theme';
import GlobalStyle from './styles/globalStyle';

import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from './redux/reducers';

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(thunkMiddleware))
);


ReactDOM.render(
  <Provider store={store}>
    <Theme>
      <GlobalStyle />
      <Suspense fallback="...">
        <App />
      </Suspense>
    </Theme>
  </Provider>,
  document.getElementById('root'),
);
