import React from 'react';
import styled from 'styled-components';
import Nav from '../Nav';
import Footer from '../Footer/Footer';

interface Props {
  children: React.ReactNode
}

const Root = styled.div`
  position: relative;
  height: 100%;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Main = styled.div`
  flex: 1
`;

const Layout = ({ children }: Props) => (
  <Root>
    <Main>
      <Nav />
      {children}
    </Main>
    <Footer />
  </Root>
);

export default Layout;
