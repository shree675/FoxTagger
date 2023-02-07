import React from 'react';
import useStreamMessages from '../hooks/useStreamMessages';
import MessageCard from './MessageCard';

const MessageList = ({ isNewMsg, convoMessages, selectedConvo }: any) => {
  useStreamMessages(selectedConvo);

  return (
    <div className="msgs-container flex flex-dir-col">
      <div className="mt-auto">
        {!isNewMsg &&
          convoMessages.map((msg: any) => {
            return <MessageCard key={`${msg.id}_${Date.now()}`} msg={msg} />;
          })}
      </div>
    </div>
  );
};

export default MessageList;
