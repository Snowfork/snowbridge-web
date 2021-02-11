import styled from 'styled-components';

interface StyledProps {
  icon?: any;
}

export const StyledButton = styled.button<StyledProps>`
  display: ${(props) => props.icon && 'flex'};
  border-radius: 6px;
  padding: 9px 20px;
  border: 1px solid ${(props) => props.theme.colors.primary.main};
  background-color: transparent;
  color: ${(props) => props.theme.colors.primary.main};
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 180ms ease-out;
  :hover {
    background-color: rgba(63, 81, 181, 0.07);
  }
`;

export const Icon = styled.div`
  margin-left: 10px;
`;
