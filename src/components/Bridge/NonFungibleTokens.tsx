import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnedNonFungibleAssets } from '../../redux/actions/bridge';
import { RootState } from '../../redux/store';

export const NonFungibleTokens = () => {
  const {
    bridge: {
      ownedNonFungibleAssets,
    },
    net: {
      ethAddress,
    },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOwnedNonFungibleAssets());
  }, [dispatch, ethAddress]);

  return (
    <div>
      {

          Object.keys(ownedNonFungibleAssets).map((contract, index) => (
            <div key={index}>
              <h3>{Object.values(ownedNonFungibleAssets[contract as any])[0]?.name}</h3>
              <h5>{contract}</h5>
              <ul>
                {
                    Object.values(ownedNonFungibleAssets[contract as any]).map((ownedNft, index) => (
                      <li key={index}>
                        <img src={ownedNft.tokenURI} alt="token preview" />
                        <p>
                          id:
                          {ownedNft.id}
                        </p>
                      </li>
                    ))
                }
              </ul>
            </div>
          ))
      }
    </div>
  );
};
