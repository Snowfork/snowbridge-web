import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnedNonFungibleAssets } from '../../redux/actions/bridge';
import { RootState } from '../../redux/store';

export const NonFungibleTokens = () => {
  const {
    bridge: {
      ownedNonFungibleAssets,
    },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOwnedNonFungibleAssets());
  }, [dispatch]);

  return (
    <div>
      {
          Object.keys(ownedNonFungibleAssets).map((contract, index) => (
            <div key={index}>
              <h3>{contract}</h3>
              <ul>
                {
                    Object.values(ownedNonFungibleAssets[contract as any]).map((id, index) => (
                      <li key={index}>{id}</li>
                    ))
                }
              </ul>
            </div>
          ))
      }
    </div>
  );
};
