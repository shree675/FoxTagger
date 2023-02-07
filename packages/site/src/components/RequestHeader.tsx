/* eslint-disable no-negated-condition */
import React, { useContext } from 'react';
import { WalletContext } from '../contexts/WalletContext';
import { shortAddress } from '../utils/utils';
import { XmtpContext } from '../contexts/XmtpContext';

const Header = () => {
  const { connectWallet, walletAddress, signer } = useContext(WalletContext);
  const [providerState] = useContext(XmtpContext);

  return (
    <div className="text-center w-full">
      {walletAddress ? (
        <div>
          <h3 className="text-lg font-bold mx-auto">
            {shortAddress(walletAddress)}
          </h3>
          {!providerState.client && (
            <button
              className="p-4 bg-orange-500 rounded-md text-white my-3 mx-auto shadow-lg block"
              onClick={() => providerState.initClient(signer)}
            >
              Connect to XMTP
            </button>
          )}
        </div>
      ) : (
        <button
          className="p-4 bg-blue-400 rounded-md text-white my-3 mx-auto shadow-lg"
          onClick={connectWallet}
        >
          {!window.ethereum?.isMetaMask ? 'Install MetaMask' : 'Connect wallet'}
        </button>
      )}
    </div>
  );
};

export default Header;
