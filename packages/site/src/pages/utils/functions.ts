import { BigNumber, utils } from 'ethers';

export const getPersistentStorage = async () => {
  return await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
};

export const clearPersistentStorage = async () => {
  await wallet.request({
    method: 'snap_manageState',
    params: ['clear'],
  });
};

export const setPersistentStorage = async (
  data: Record<string, unknown> | void,
) => {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', data],
  });
};

export const toEth = (wei: BigNumber) => {
  return `${Number(utils.formatEther(wei)).toFixed(18)} GoerliETH`;
};

export const toEthInt = (wei: BigNumber) => {
  return `${Number(utils.formatEther(wei)).toFixed(18)}`;
};

export const compact = (hash: string) => {
  return `${hash.slice(0, 5)}...${hash.slice(hash.length - 4, hash.length)}`;
};
