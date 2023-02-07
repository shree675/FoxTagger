import { createContext, ReactNode, useState } from 'react';
import Web3Modal from 'web3modal';
import { ethers, Signer } from 'ethers';

type WalletContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void;
  walletAddress: string | null;
  signer: Signer | null;
};

export const WalletContext = createContext<WalletContextType>({
  connectWallet: () => undefined,
  disconnectWallet: () => undefined,
  walletAddress: null,
  signer: null,
});

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const providerOptions: any = {};

  const web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    providerOptions, // required
  });

  const disconnectWallet = () => {
    setWalletAddress(null);
    setSigner(null);
  };

  const connectWallet = async () => {
    const instance = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const newSigner = await web3Provider.getSigner();
    console.log(newSigner);
    setSigner(newSigner);
    setWalletAddress(await newSigner.getAddress());

    instance.on('accountsChanged', () => {
      disconnectWallet();
    });

    instance.on('connect', () => {
      connectWallet();
    });

    instance.on('disconnect', () => {
      disconnectWallet();
    });
  };

  // Redirect User to Install MetaMask if not already installed
  if (!window.ethereum?.isMetaMask) {
    providerOptions['custom-metamask'] = {
      display: {},
      package: {},
      connector: async () => {
        window.open('https://metamask.io');
      },
    };
  }

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        walletAddress,
        signer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
