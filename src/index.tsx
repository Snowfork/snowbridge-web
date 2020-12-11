import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import Theme from './styles/theme';
import GlobalStyle from './styles/globalStyle';

import App from './App';

// import { selectNet } from './actions';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

import reducers from './redux/reducers';

const store = createStore(
  reducers,
  devToolsEnhancer({})
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
