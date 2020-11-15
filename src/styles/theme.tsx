import React, { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    primary: {
      main: 'rgb(36, 41, 46)',
    },
    secondary: {
      main: 'rgb(36, 41, 46)',
    },
    text: {
      main: '#000',
    },
  },
  breakpoints: {},
} as const;

type Props = {
  children: ReactNode;
};

const Theme = ({ children }: Props) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default Theme;
