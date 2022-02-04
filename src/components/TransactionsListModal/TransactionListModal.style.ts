import styled from 'styled-components';

export const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
`;

export const Heading = styled.h2`
  text-align: center;
  top:0;
  position:fixed;
`;

export const List = styled.ul`
  margin: 53px 0;
  padding: 15px;
  width: 100%;
  gap: 25px;
  display: flex;
  flex-direction: column;
  max-height: 300px
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const Button = styled.button`
  margin-top: 20px;
`;
