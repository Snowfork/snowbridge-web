import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import Theme from './styles/theme';
import GlobalStyle from './styles/globaStyle';

import App from './App';

// import { selectNet } from './actions';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from './redux/reducers';

ReactDOM.render(
  <Provider store={createStore(reducers)}>
    <Theme>
      <GlobalStyle />
      <Suspense fallback="...">
        <App />
      </Suspense>
    </Theme>
  </Provider>,
  document.getElementById('root'),
);
