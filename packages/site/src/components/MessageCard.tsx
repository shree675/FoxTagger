import React, { useContext, useEffect, useState } from 'react';
import { getStorage, setStorage } from '../utils';
import { WalletContext } from '../contexts/WalletContext';
import {
  checkTransactionconfirmation,
  convertEthToWei,
  sendAmount,
  shortAddress,
} from '../utils/utils';

const MessageCard = ({ msg }: any) => {
  const { walletAddress: myAddress } = useContext(WalletContext);

  const { message, id } = JSON.parse(msg.content);

  const [paidStatus, setPaidStatus] = useState(false);

  const pay = async () => {
    console.log(message);

    try {
      const txHash = await sendAmount(
        convertEthToWei(message),
        msg.senderAddress,
        myAddress || '',
      );
      let storage = await getStorage();

      // if (!storage?.[myAddress || 'empty']) {
      //   storage = {};
      // }

      if (!storage) {
        storage = {};
      }

      if (myAddress === null) {
        return;
      }

      const idToHash = {};
      idToHash[id] = txHash;

      storage[myAddress] = { idToHash };

      await setStorage(storage);
      console.log('pay');

      const txHashes = await getStorage();
      console.log('txHashes', txHashes);
    } catch (error) {
      console.log('error', error);
    }
  };

  const checkPayment = async () => {
    const storage = await getStorage();
    if (storage === null) {
      return;
    }

    if (myAddress === null) {
      return;
    }

    const txHash = storage[myAddress]?.idToHash[id];

    if (!txHash) {
      return;
    }
    const status = await checkTransactionconfirmation(txHash);
    setPaidStatus(status);
  };

  useEffect(() => {
    checkPayment();
  }, []);

  const isMe = msg.senderAddress.toLowerCase() === myAddress?.toLowerCase();

  return (
    <>
      <div className="flex justify-start">
        <div className="align-start flex justify-start w-full">
          <div className="justify-between bg-orange-400 w-full my-3 p-4 rounded-lg">
            <b className="text-2xl mr-3">{shortAddress(msg.senderAddress)}</b>
            <div className="text-2xl flex justify-between">
              {message}
              {!isMe && !paidStatus && (
                <button
                  className="rounded-md px-3 py-2 bg-purple-500 text-white"
                  onClick={pay}
                >
                  Pay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageCard;
