import React from 'react';
import styled from 'styled-components';

type Props = {
  href: string;
  className?: string;
};

const ExternalLink = ({ href, children, className }: React.PropsWithChildren<Props>) => {
  return (
    <a className={className}
      rel="noopener noreferrer"
      target="_blank"
      href={href}>{children}</a>);
};

export default styled(ExternalLink)`
  color: ${props => props.theme.colors.main};
`;
