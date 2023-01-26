import { getPersistentStorage, toEth } from './utils/functions';
import {
  NO_TAG_MESSAGE,
  FOOTER_NOTE,
  EXCEEDED_MESSAGE,
  WILL_EXCEED_MESSAGE,
} from './utils/constants';

/**
 * Provides transaction insights.
 *
 * @param transaction - The transaction details.
 * @returns 'insights' object.
 * @throws If the persistent storage is empty.
 * @throws If the persistent storage has incorrect fields.
 */
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

  const used = storage.usage[tag].used;
  const limit = storage.usage[tag].limit;
  const amount = parseInt(transaction.value as string);
  const gas =
    parseInt(transaction.gasUsed as string) *
    parseInt(transaction.gasPrice as string);
  const total = amount + gas;

  let usedPercent = (used / limit) * 100.0;

  // rounding to two decimal places
  usedPercent = Number(Math.round(parseFloat(usedPercent + 'e+2')) + 'e-2');

  let usageMsg = usedPercent + '%';

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
