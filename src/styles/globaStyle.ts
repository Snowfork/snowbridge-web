import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    --color-text: #000;
  }
  body {
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    color: var(--color-text);
  }
`;

export default GlobalStyle;
