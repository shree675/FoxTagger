import React from 'react';
import Input from './Input';

const MessageComposer = ({ msgTxt, setMsgTxt, sendNewMessage }: any) => {
  return (
    <div className="flex">
      <Input
        setNewValue={setMsgTxt}
        placeholder="Amount"
        value={msgTxt}
        onInputBlur={() => undefined}
        type="number"
        min={0}
        step={0.000000000000000001}
      />
      <button className="btn" onClick={sendNewMessage}>
        Send
      </button>
    </div>
  );
};

export default MessageComposer;
