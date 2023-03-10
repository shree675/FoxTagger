import { BigNumber } from 'ethers';

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
  return `${wei
    .div(BigNumber.from('1000000000000000000'))
    .toString()} GoerliETH`;
};

export const compact = (hash: string) => {
  return `${hash.slice(0, 5)}...${hash.slice(hash.length - 4, hash.length)}`;
};
