import React from 'react';
import Input from './Input';

const MessageComposer = ({ msgTxt, setMsgTxt, sendNewMessage }: any) => {
  return (
    <div className="flex justify-between my-4">
      <Input
        setNewValue={setMsgTxt}
        placeholder="Amount"
        value={msgTxt}
        onInputBlur={() => undefined}
        type="number"
        min={0}
        step={0.000000000000000001}
      />
      <button
        className="bg-purple-500 px-4 py-2 text-white rounded-md mx-2"
        onClick={sendNewMessage}
      >
        Send
      </button>
    </div>
  );
};

export default MessageComposer;
