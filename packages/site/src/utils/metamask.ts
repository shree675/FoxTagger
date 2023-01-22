/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  // return true;

  const provider = window.ethereum;
  console.log("provider", provider);

  try {
    const clientVersion = await provider?.request({
      method: "web3_clientVersion",
    });
    console.log("line 14");

    const isFlaskDetected = (clientVersion as string[])?.includes("flask");

    return Boolean(provider && isFlaskDetected);
  } catch {
    console.log("error");
    return false;
  }
};
