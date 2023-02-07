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
    try {
      const txHash = await sendAmount(
        convertEthToWei(message),
        msg.senderAddress,
        myAddress || '',
      );
      const storage = {};
      storage[id] = txHash;
      await setStorage(storage);
      const txHashes = await getStorage();
      console.log('txHashes', txHashes);
    } catch (error) {
      console.log('error', error);
    }
    console.log('pay');
  };

  const checkPayment = async () => {
    const txHashes = await getStorage();
    const txHash = txHashes[id];
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
      <div className="msg-header flex justify-start">
        <div className="identicon" />
        <div className="convo-info align-start flex-dir-col flex justify-start">
          <div>
            <b>{shortAddress(msg.senderAddress)}</b>
          </div>
          {msg.senderAddress !== myAddress && (
            <div>
              {message}
              {!isMe && !paidStatus && <button onClick={pay}>Pay</button>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageCard;
