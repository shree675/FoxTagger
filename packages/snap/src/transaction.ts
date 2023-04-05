import { BigNumber, FixedNumber } from 'ethers';
import { panel, heading, text } from '@metamask/snaps-ui';
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
      content: panel([heading('Tag'), text(NO_TAG_MESSAGE)]),
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
    const fixedUsed = FixedNumber.from(used);
    const fixedLimit = FixedNumber.from(limit);
    const usedPercent = (
      Number(fixedUsed.divUnsafe(fixedLimit).toString()) * 100
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

    if (!limit.eq('0')) {
      if (used.gt(limit)) {
        alerts += `${EXCEEDED_MESSAGE + toEth(limit)} for the tag ${tag}. `;
      } else if (used.add(total).gte(limit)) {
        alerts += `${WILL_EXCEED_MESSAGE + toEth(limit)} for the tag ${tag}. `;
      }
    }
  }

  if (alerts === '') {
    return {
      content: panel([
        heading('Tag'),
        text(tags),
        heading('Usage'),
        text(usageMsg),
        text(FOOTER_NOTE),
      ]),
    };
  }

  return {
    content: panel([
      heading('Tag'),
      text(tags),
      heading('Usage'),
      text(usageMsg),
      text(FOOTER_NOTE),
      heading('Alerts'),
      text(alerts),
    ]),
  };
};
