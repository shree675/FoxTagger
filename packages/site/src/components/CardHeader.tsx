import React from 'react';

const CardHeader = ({
  setIsNewMsg,
}: {
  setIsNewMsg: (arg0: boolean) => void;
}) => {
  return (
    <div className="flex justify-between">
      <h4 className="text-lg font-bold my-4   ">Conversations</h4>
      <div>
        <button
          onClick={() => setIsNewMsg(true)}
          className="rounded-md shadow-lg px-4 p-3 bg-blue-500 text-white my-3"
        >
          + New request
        </button>
      </div>
    </div>
  );
};

export default CardHeader;
