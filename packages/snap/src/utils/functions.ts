import { BigNumber } from 'ethers';

export const getPersistentStorage: any = async () => {
  return await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
};

export const clearPersistentStorage = async () => {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'clear' },
  });
};

export const setPersistentStorage = async (
  data: Record<string, unknown> | void,
) => {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: data },
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
