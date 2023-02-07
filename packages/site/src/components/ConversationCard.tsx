import React from 'react';
import { shortAddress, truncate } from '../utils/utils';

const ConversationCard = ({
  setSelectedConvo,
  address,
  latestMessage,
}: any) => {
  let message;

  try {
    message = JSON.parse(latestMessage.content).message;
  } catch (error) {
    message = latestMessage.content;
  }

  return (
    <div
      className="border-sm rounded-lg p-4 border-black shadow-sm bg-gray-200 my-4"
      onClick={() => setSelectedConvo(address)}
    >
      <div className="text-3xl font-bold">{shortAddress(address)}</div>
      <div className="text-2xl">{latestMessage && truncate(message, 75)}</div>
    </div>
  );
};

export default ConversationCard;
