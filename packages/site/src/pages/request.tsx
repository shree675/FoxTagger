import React, { useContext, useState } from 'react';
import { XmtpContext } from '../contexts/XmtpContext';
import useSendMessage from '../hooks/useSendMessage';
import Header from '../components/RequestHeader';
import CardHeader from '../components/CardHeader';
import MessageComposer from '../components/MessageComposer';
import AddressInput from '../components/AddressInput';
import BackButton from '../components/BackButton';
import MessageList from '../components/MessageList';
import ConversationList from '../components/ConversationList';
import useStreamConversations from '../hooks/useStreamConversations';

const Home = () => {
  const [providerState] = useContext(XmtpContext);
  const { convoMessages, client } = providerState;
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [msgTxt, setMsgTxt] = useState('');
  const { sendMessage } = useSendMessage(selectedConvo);
  useStreamConversations();
  const [isNewMsg, setIsNewMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setSelectedConvo(null);
    setIsNewMsg(false);
    setErrorMsg('');
    setMsgTxt('');
  };

  const checkIfOnNetwork = async (address) => {
    return (await client?.canMessage(address)) || false;
  };

  const onInputBlur = async (newAddress) => {
    if (!newAddress.startsWith('0x') || newAddress.length !== 42) {
      setErrorMsg('Invalid address');
    } else {
      const isOnNetwork = await checkIfOnNetwork(newAddress);
      // eslint-disable-next-line no-negated-condition
      if (!isOnNetwork) {
        setErrorMsg('Address not on XMTP network');
      } else {
        setSelectedConvo(newAddress);
        setErrorMsg('');
      }
    }
  };

  const sendNewMessage = () => {
    const payload = {
      id: Date.now(),
      message: msgTxt,
    };
    sendMessage(JSON.stringify(payload));
    setMsgTxt('');
  };

  return (
    <div className="flex align-center flex-dir-col home">
      <Header />
      {client && (
        <div className="card">
          {!selectedConvo && !isNewMsg ? (
            <>
              <CardHeader setIsNewMsg={setIsNewMsg} />
              <div className="conversation-list">
                <ConversationList
                  convoMessages={convoMessages}
                  setSelectedConvo={setSelectedConvo}
                />
              </div>
            </>
          ) : (
            <>
              <div className="conversation-header align-center flex justify-start">
                <BackButton reset={reset} />
                <div className="identicon"></div>
                <AddressInput
                  isNewMsg={isNewMsg}
                  onInputBlur={onInputBlur}
                  errorMsg={errorMsg}
                  selectedConvo={selectedConvo}
                />
              </div>
              <MessageList
                isNewMsg={isNewMsg}
                convoMessages={convoMessages.get(selectedConvo || '') ?? []}
                selectedConvo={selectedConvo}
              />
              <hr />
              <MessageComposer
                msgTxt={msgTxt}
                setMsgTxt={setMsgTxt}
                sendNewMessage={sendNewMessage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
