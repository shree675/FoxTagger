import { useContext } from 'react';
import { XmtpContext } from '../contexts/XmtpContext';

const useSendMessage = (peerAddress: any) => {
  const [providerState] = useContext(XmtpContext);
  const { client } = providerState || {};

  const sendMessage = async (payload: any) => {
    if (!client || !peerAddress) {
      return;
    }
    const conversation = await client.conversations.newConversation(
      peerAddress,
    );
    if (!conversation) {
      return;
    }

    await conversation.send(payload);
  };

  return {
    sendMessage,
  };
};

export default useSendMessage;
