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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
  ...props
}: IButtonProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <S.StyledButton icon={icon} onClick={onClick} {...props}>
    {children}
    {icon && <S.Icon>{icon}</S.Icon>}
  </S.StyledButton>
);

export default Button;
