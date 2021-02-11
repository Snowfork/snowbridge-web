import React, { ReactNode } from 'react';
import * as S from './IconButton.style';

export interface IButtonProps {
  icon: ReactNode;
  primary?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  style: object;
}

const Button: React.FC<IButtonProps> = ({
  icon,
  primary,
  onClick = () => {},
  ...props
}) => {
  return (
    <S.StyledButton primary={primary} onClick={onClick} {...props}>
      {icon}
    </S.StyledButton>
  );
};

export default Button;
