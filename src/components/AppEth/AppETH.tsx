/* eslint-disable no-console */
// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import styled from 'styled-components';
import LockToken from './LockToken';
// ------------------------------------------
//               AppETH component
// ------------------------------------------
function AppETH(): React.ReactElement {
  // Render
  return (

    <LockToken />
  );
}

export default React.memo(styled(AppETH)`
  opacity: 0.5;
  padding: 1rem 1.5rem;
`);
