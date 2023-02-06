import React from 'react';
import Input from './Input';

const MessageComposer = ({ msgTxt, setMsgTxt, sendNewMessage }: any) => {
  return (
    <div className="flex">
      <Input
        setNewValue={setMsgTxt}
        placeholder="Write a message"
        value={msgTxt}
        onInputBlur={() => undefined}
      />
      <button className="btn" onClick={sendNewMessage}>
        Send
      </button>
    </div>
  );
};

export default MessageComposer;
