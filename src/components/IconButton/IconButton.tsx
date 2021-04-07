import React, { ReactNode } from 'react';
import * as S from './IconButton.style';

export interface IButtonProps {
  icon: ReactNode;
  primary?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  // eslint-disable-next-line @typescript-eslint/ban-types
  style: object;
}

const Button: React.FC<IButtonProps> = ({
  icon,
  primary,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onClick = () => {},
  ...props
}: IButtonProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <S.StyledButton primary={primary} onClick={onClick} {...props}>
    {icon}
  </S.StyledButton>
);

export default Button;
