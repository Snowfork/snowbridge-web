import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../utils/hooks';
import ConfirmTransactionModal from '../ConfirmTransactionModal';
import SelectAssetModal from '../SelectAssetModal';
import TransferPanel from './TransferPanel/TransferPanel';

type Props = {
  className?: string;
}

const Bridge = ({ className }: Props) => {
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const { showConfirmTransactionModal } = useAppSelector((state) => state.bridge);

  return (
    <div className={className}>
      <TransferPanel setShowAssetSelector={setShowAssetSelector} />
      <SelectAssetModal
        open={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
      />
      <ConfirmTransactionModal
        open={showConfirmTransactionModal}
      />
    </div>
  );
}

export default styled(Bridge)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  height: calc(100% - 150px);
`;
