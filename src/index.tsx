import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import App from './App';
import GlobalStyle from './styles/globalStyle';
import Theme from './styles/theme';
import reducers from './redux/reducers';

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware(thunkMiddleware)),
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
