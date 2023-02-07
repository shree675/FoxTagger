import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Client } from '@xmtp/xmtp-js';
import { JsonRpcSigner } from 'ethers';

import { WalletContext } from './WalletContext';

type XmtpContextType = [
  {
    client: Client | null;
    initClient: (wallet: JsonRpcSigner | null) => void;
    loadingConversations: boolean;
    conversations: Map<string, any>;
    convoMessages: Map<string, any>;
  },
  React.Dispatch<React.SetStateAction<any>>,
];

const initialValue: XmtpContextType = [
  {
    client: null,
    initClient: () => undefined,
    loadingConversations: true,
    conversations: new Map(),
    convoMessages: new Map(),
  },
  () => undefined,
];

export const XmtpContext = createContext<XmtpContextType>(initialValue);

export const XmtpContextProvider = ({ children }: { children: ReactNode }) => {
  const { signer, walletAddress } = useContext(WalletContext);
  const [providerState, setProviderState] = useState(initialValue[0]);

  const initClient = async (wallet: JsonRpcSigner | null) => {
    if (wallet && !providerState.client) {
      try {
        const client = await Client.create(wallet, { env: 'dev' });
        setProviderState({
          ...providerState,
          client,
        });
      } catch (e) {
        console.error(e);
        setProviderState({
          ...providerState,
          client: null,
        });
      }
    }
  };

  const disconnect = () => {
    setProviderState({
      ...providerState,
      client: null,
      conversations: new Map(),
      convoMessages: new Map(),
    });
  };

  useEffect(() => {
    signer ? setProviderState({ ...providerState, initClient }) : disconnect();
    // eslint-disable-next-line
  }, [signer]);

  useEffect(() => {
    if (!providerState.client) {
      return;
    }

    const listConversations = async () => {
      console.log('Listing conversations');
      setProviderState({ ...providerState, loadingConversations: true });
      const { client, convoMessages, conversations } = providerState;
      if (!client) {
        return;
      }
      const convos = (await client.conversations.list()).filter(
        (conversation) => !conversation.context?.conversationId,
      );
      Promise.all(
        convos.map(async (convo) => {
          if (convo.peerAddress !== walletAddress) {
            const messages = await convo.messages();
            convoMessages.set(convo.peerAddress, messages);
            conversations.set(convo.peerAddress, convo);
            setProviderState({
              ...providerState,
              convoMessages,
              conversations,
            });
          }
        }),
      ).then(() => {
        setProviderState({ ...providerState, loadingConversations: false });
      });
    };

    listConversations();
    // eslint-disable-next-line
  }, [providerState.client]);

  return (
    <XmtpContext.Provider value={[providerState, setProviderState]}>
      {children}
    </XmtpContext.Provider>
  );
};
