export const shortAddress = (addr: string) =>
  addr.length > 10 && addr.startsWith('0x')
    ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    : addr;

export const truncate = (str: string, length: number) => {
  if (!str) {
    return str;
  }

  if (str.length > length) {
    return `${str.substring(0, length - 3)}...`;
  }

  return str;
};

export const getLatestMessage = (messages: any) =>
  messages?.length ? messages[messages.length - 1] : null;

// request feature functions

// convert eth to wei
export const convertEthToWei = (eth: string) => {
  const wei = parseFloat(eth) * 1e18;
  return wei.toString();
};

export const sendAmount = async (
  amount: string,
  toAddress: string,
  fromAddress: string,
) => {
  const txHash: string = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: fromAddress,
        to: toAddress,
        value: amount,
      },
    ],
  });
  return txHash;
};

// confirm the transaction
export const checkTransactionconfirmation = (txhash) => {
  const checkTransactionLoop = async () => {
    const val = await window.ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txhash],
    });

    if (val !== null) {
      return true;
    }

    return checkTransactionLoop();
  };

  return checkTransactionLoop();
};
