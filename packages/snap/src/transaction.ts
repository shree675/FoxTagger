import { BigNumber } from 'ethers';
import { getPersistentStorage, toEth } from './utils/functions';
import {
  NO_TAG_MESSAGE,
  FOOTER_NOTE,
  EXCEEDED_MESSAGE,
  WILL_EXCEED_MESSAGE,
} from './utils/constants';

export const getDetails = async (transaction: Record<string, unknown>) => {
  const toAddress = (transaction.to as string).toLowerCase();
  const account = (transaction.from as string).toLowerCase();
  const completeStorage = (await getPersistentStorage()) as any;

  if (!completeStorage?.[account]) {
    throw new Error('Storage initialization failed.');
  }

  const storage = completeStorage[account];

  if (!storage.mainMapping || !storage.usage) {
    throw new Error('Data corrput. Please re-install the snap.');
  }

  const tagList = storage.mainMapping[toAddress];
  if (!tagList?.length) {
    return {
      Tag: NO_TAG_MESSAGE,
    };
  }

  let tags = '';
  let alerts = '';
  let usageMsg = '';

  for (const tag of tagList) {
    if (tag === '') {
      tags += `${tag}`;
    } else {
      tags += `, ${tag}`;
    }
    const { used } = storage.usage[tag];
    const { limit } = storage.usage[tag];
    const amount = BigNumber.from(transaction.value as string);
    const gas = BigNumber.from(transaction.gas as string);
    const total = amount.add(gas);

    let usedPercent = used.div(limit).toNumber() * 100.0;

    // rounding to two decimal places
    usedPercent = Number(`${Math.round(parseFloat(`${usedPercent}e+2`))}e-2`);

    if (usageMsg === '') {
      usageMsg = `${tag}: ${usedPercent}%`;
    } else {
      usageMsg = ` | ${tag}: ${usedPercent}%`;
    }

    if (used > limit) {
      alerts += `${EXCEEDED_MESSAGE + toEth(limit)} for the tag ${tag}\n`;
    } else if (used + total >= limit) {
      alerts += `${WILL_EXCEED_MESSAGE + toEth(limit)} for the tag ${tag}\n`;
    }
  }

  return {
    Tag: tags,
    Usage: usageMsg + FOOTER_NOTE,
    Alerts: alerts === '' ? 'None' : alerts,
  };
};
