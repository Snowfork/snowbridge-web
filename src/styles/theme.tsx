import { createMuiTheme } from '@material-ui/core';
// import React, { ReactNode } from 'react';
// import { ThemeProvider } from 'styled-components';

// const theme = {
//   backgroundColor: '#0f1013',
//   colors: {
//     yellow2: '#c79f2260',
//     primary: {
//       main: '#3f51b5',
//     },
//     secondary: {
//       main: 'rgb(36, 41, 46)',
//     },
//     text: {
//       main: '#000',
//     },
//   },
//   breakpoints: {},
// } as const;

// type Props = {
//   children: ReactNode;
// };

// const Theme = ({ children }: Props) => (
//   <ThemeProvider theme={theme}>{children}</ThemeProvider>
// );

// export default Theme;

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
  },
});
// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// const Theme = ({ children }: Props) => (
//   <ThemeProvider theme={theme}>{children}</ThemeProvider>
// );

export default theme;
