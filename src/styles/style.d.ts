import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    borderRadius: string;

    colors: {
      background: string;
      main: string;
      secondary: string;

      transferPanelBorder: string;
      transferPanelBackground: string;

      panelBorder: string;
      panelBackground: string;

      errorBackground: string;
    };
  }
}
