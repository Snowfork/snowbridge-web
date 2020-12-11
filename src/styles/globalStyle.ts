import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    --color-text: black;
    background-color: rgb(15, 16, 19);
  }
  body {
    font-family: "Menlo Regular", "Helvetica", "Arial", sans-serif;
    color: var(--color-text);
  }

  @font-face {
    font-family: 'Menlo Regular';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/Menlo-Regular.woff') format('woff');
  }

`;

export default GlobalStyle;
