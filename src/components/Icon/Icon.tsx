import React from 'react';
import { useTheme } from 'styled-components';
import icons from './index';
import { IconKeys } from '../../types/types';

interface IIconProps {
  width?: string;
  height?: string;
  size?: string;
  color?: string;
  name?: IconKeys;
  className?: string;
}

const defaultSize = '24px';

const Icon = ({
  width, height, size, color, name, className, ...props
}: IIconProps) => {
  const theme = useTheme();
  const IconComponent = name && icons[name];

  if (!IconComponent || typeof IconComponent === 'string') {
    return null;
  }

  return (
    <IconComponent
      className={className}
      width={width || size || defaultSize}
      height={height || size || defaultSize}
      color={color || theme.colors.main}
      {...props}
    />
  );
};

export default Icon;
