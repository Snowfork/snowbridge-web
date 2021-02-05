import styled from 'styled-components';

interface StyledProps {
  primary?: boolean;
  icon?: any;
}

export const StyledButton = styled.button<StyledProps>`
  border: none;
  background-color: transparent;
  color: ${(props) =>
    props.primary ? props.theme.colors.primary.main : '#888'};
  cursor: pointer;
  transition: color 180ms ease-out;
  margin: 0;
  padding: 0;
  :hover {
  }
`;
