import React, { ReactNode } from 'react';
import * as S from './Button.style';

export interface IButtonProps {
  children?: ReactNode;
  props?: any;
  icon?: any;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Button: React.FC<IButtonProps> = ({
  children,
  icon,
  onClick = () => {},
  ...props
}) => {
  return (
    <S.StyledButton icon={icon} onClick={onClick} {...props}>
      {children}
      {icon && <S.Icon>{icon}</S.Icon>}
    </S.StyledButton>
  );
};

export default Button;
