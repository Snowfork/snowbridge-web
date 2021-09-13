import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html {
    --color-text: black;
    background-color: rgb(15, 16, 19);
    height: max-content;
    min-height: 100vh;
  }

  body {
    font-family: "Menlo Regular", "Helvetica", "Arial", sans-serif;
    color: var(--color-text);
    height: max-content;
    min-height: 100vh;
  }

  #root {
    height: max-content;
    min-height: 100vh;
  }

  @font-face {
    font-family: 'Menlo Regular';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/Menlo-Regular.woff') format('woff');
  }

  @font-face {
    font-family: 'SF UI Text Regular';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-Regular.woff') format('woff');
  }

  @font-face {
    font-family: 'SF UI Text';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-Regular.woff') format('woff');
  }

  @font-face {
    font-family: 'SF UI Text Italic';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-RegularItalic.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Light';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-Light.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Light Italic';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-LightItalic.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Medium';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-Medium.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Medium Italic';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-MediumItalic.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Semibold';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-Semibold.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Semibold Italic';
    font-style: normal;
    font-weight: normal;
    src: url('SFUIText-SemiboldItalic.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Bold';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-Bold.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Bold Italic';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-BoldItalic.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Heavy';
    font-style: normal;
    font-weight: normal;
    src: url('SFUIText-Heavy.woff') format('woff');
  }


  @font-face {
    font-family: 'SF UI Text Heavy Italic';
    font-style: normal;
    font-weight: normal;
    src: url('/fonts/SFUIText-HeavyItalic.woff') format('woff');
  }
`;

export default GlobalStyle;
