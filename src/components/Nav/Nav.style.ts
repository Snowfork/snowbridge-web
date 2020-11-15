import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #24292e;
  padding: 0 30px;
`;

export const Heading = styled.h1`
  font-size: 20px;
  color: white;
`;

export const CurrencyList = styled.ul`
  display: flex;
  flex-direction: column;
  li {
    margin-top: 0.5em;
  }
  li:first-of-type {
    margin-top: 0;
  }
`;
