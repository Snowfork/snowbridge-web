// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslation as useTranslationBase } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useTranslation() {
  return useTranslationBase('app-ethereum-bridge');
}
