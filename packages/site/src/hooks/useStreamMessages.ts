import { Conversation, Stream } from '@xmtp/xmtp-js';
import { useState, useEffect, useContext } from 'react';
import { WalletContext } from '../contexts/WalletContext';
import { XmtpContext } from '../contexts/XmtpContext';

const useStreamMessages = (peerAddress: string) => {
  const { walletAddress } = useContext(WalletContext);
  const [providerState, setProviderState] = useContext(XmtpContext);
  const { client, convoMessages } = providerState;
  const [stream, setStream] = useState<Stream<any>>();
  const [conversation, setConversation] = useState<Conversation>();

  useEffect(() => {
    const getConvo = async () => {
      if (!client || !peerAddress) {
        return;
      }
      setConversation(await client.conversations.newConversation(peerAddress));
    };
    getConvo();
  }, [client, peerAddress]);

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const streamMessages = async () => {
      const newStream = await conversation.streamMessages();
      setStream(newStream);
      for await (const msg of newStream) {
        if (setProviderState) {
          const newMessages = convoMessages.get(conversation.peerAddress) ?? [];
          newMessages.push(msg);
          const uniqueMessages = [
            ...Array.from(
              new Map(newMessages.map((item: any) => [item.id, item])).values(),
            ),
          ];
          convoMessages.set(conversation.peerAddress, uniqueMessages);
          setProviderState({
            ...providerState,
            convoMessages: new Map(convoMessages),
          });
        }
      }
    };
    streamMessages();

    // eslint-disable-next-line consistent-return
    return () => {
      const closeStream = async () => {
        if (!stream) {
          return;
        }
        await stream.return();
      };
      closeStream();
    };
    // eslint-disable-next-line
  }, [convoMessages, walletAddress, conversation]);
};

export default useStreamMessages;
