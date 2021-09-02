import React from 'react';

type Props = {
    children: React.ReactNode,
    value: number,
    index: number
  };

export const TabPanel = ({
  children,
  value,
  index,
}: Props) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
  >
    {value === index && (
      <>{ children }</>
    )}
  </div>
);
