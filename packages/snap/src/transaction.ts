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
    if (tags === '') {
      tags += `${tag}`;
    } else {
      tags += `, ${tag}`;
    }
    let { used } = storage.usage[tag];
    let { limit } = storage.usage[tag];
    // TODO: change this
    const usedPercent = (
      (parseInt(used, 10) / parseInt(limit, 10)) *
      100
    ).toFixed(2);
    used = BigNumber.from(used);
    limit = BigNumber.from(limit);

    const amount = BigNumber.from(transaction.value as string);
    const gas = BigNumber.from(transaction.gas as string);
    const total = amount.add(gas);

    if (usageMsg === '') {
      usageMsg += `${tag}: ${usedPercent}%`;
    } else {
      usageMsg += ` | ${tag}: ${usedPercent}%`;
    }

    // TODO: check for "0" condition
    if (used.gt(limit)) {
      alerts += `${EXCEEDED_MESSAGE + toEth(limit)} for the tag ${tag}.\n`;
    } else if (used.add(total).gte(limit)) {
      alerts += `${WILL_EXCEED_MESSAGE + toEth(limit)} for the tag ${tag}.\n`;
    }
  }

  if (alerts === '') {
    return {
      Tag: tags,
      Usage: usageMsg + FOOTER_NOTE,
    };
  }

  return {
    Tag: tags,
    Usage: usageMsg + FOOTER_NOTE,
    Alerts: alerts,
  };
};
