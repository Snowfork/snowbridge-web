import { DefaultTheme } from 'styled-components';

const colors = {
  shark: '#212226',
  darkGrey: '#1E1E1E',
  straw: '#CFB97F',
  pitchBlack: '#000000',
  white: 'rgba(255, 255, 255, 1)',
  green: 'green',
  red: 'red',
  thunderbird: '#BA1C10',
};

const basic: DefaultTheme = {
  borderRadius: '4px',

  colors: {
    background: colors.darkGrey,
    main: colors.straw,
    secondary: colors.white,

    transferPanelBorder: colors.pitchBlack,
    transferPanelBackground: colors.shark,

    panelBorder: colors.straw,
    panelBackground: colors.shark,

    errorBackground: colors.thunderbird,

    stepComplete: colors.green,
    stepError: colors.red,

    statusGood: colors.green,
    statusBad: colors.red,
  },
};

export { basic };
