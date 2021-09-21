import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledLine = styled.div`
  height: 2px;
  width: 40px;
  background: ${props => props.theme.colors.secondary};
  margin: 0 10px;
`;
