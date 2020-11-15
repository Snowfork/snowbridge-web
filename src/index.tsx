import ReactDOM from 'react-dom';
import React, { Suspense } from 'react';

import Theme from './styles/theme';
import GlobalStyle from './styles/globaStyle';

import App from './App';

ReactDOM.render(
  <Theme>
    <GlobalStyle />
    <Suspense fallback="...">
      <App />
    </Suspense>
  </Theme>,
  document.getElementById('root'),
);
