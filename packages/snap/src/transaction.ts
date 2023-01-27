import { getPersistentStorage, toEth } from './utils/functions';
import {
  NO_TAG_MESSAGE,
  FOOTER_NOTE,
  EXCEEDED_MESSAGE,
  WILL_EXCEED_MESSAGE,
} from './utils/constants';

export const getDetails = async (transaction: Record<string, unknown>) => {
  const toAddress = transaction.to as string;
  const storage = (await getPersistentStorage()) as any;

  if (!storage) {
    throw new Error('Storage initialization failed.');
  }

  if (!storage.mainMapping || !storage.usage) {
    throw new Error('Data corrput. Please re-install the snap.');
  }

  const tag = storage.mainMapping[toAddress];
  if (!tag) {
    return {
      Tag: NO_TAG_MESSAGE,
    };
  }

  const { used } = storage.usage[tag];
  const { limit } = storage.usage[tag];
  const amount = parseInt(transaction.value as string, 16);
  const gas = parseInt(transaction.gas as string, 16);
  const total = amount + gas;

  let usedPercent = (used / limit) * 100.0;

  // rounding to two decimal places
  usedPercent = Number(`${Math.round(parseFloat(`${usedPercent}e+2`))}e-2`);

  let usageMsg = `${usedPercent}%`;

  if (used > limit) {
    usageMsg += EXCEEDED_MESSAGE + toEth(limit);
  } else if (used + total >= limit) {
    usageMsg += WILL_EXCEED_MESSAGE + toEth(limit);
  }

  return {
    Tag: tag,
    Usage: usageMsg + FOOTER_NOTE,
  };
};
