import { compact, setPersistentStorage } from './utils/functions';
import { LIMIT_ALERT_FOOTER, LIMIT_ALERT_HEADER } from './utils/constants';

export const checkLimits = async (account: string, completeStorage: any) => {
  const storage = completeStorage[account];

  if (!storage.usage) {
    return null;
  }

  const { usage } = storage;
  const tags: string[] = [];
  const newUsage: any = {};

  for (const tag in usage) {
    if (Object.prototype.hasOwnProperty.call(usage, tag)) {
      const { used } = usage[tag];
      const { limit } = usage[tag];
      const { notified } = usage[tag];

      newUsage[tag] = usage[tag];

      if (!notified && used > limit && limit > 0) {
        tags.push(tag);
        newUsage[tag].notified = true;
      }
    }
  }

  if (tags.length > 0) {
    storage.usage = newUsage;
    completeStorage[account] = storage;
    await setPersistentStorage(completeStorage);

    let message = `${LIMIT_ALERT_HEADER + compact(account)}:\n`;
    for (const tag of tags) {
      message += `${tag},\n`;
    }
    message += LIMIT_ALERT_FOOTER;

    return message;
  }
  return null;
};

export const getSummary = async (account: string, completeStorage: any) => {
  const storage = completeStorage[account];

  if (!storage.usage) {
    return null;
  }

  const { usage } = storage;
  const newUsage: any = {};
  let exceeded = false;
  let hasTag = false;

  for (const tag in usage) {
    if (Object.prototype.hasOwnProperty.call(usage, tag)) {
      hasTag = true;
      const { used } = usage[tag];
      const { limit } = usage[tag];

      newUsage[tag] = usage[tag];

      if (used > limit && limit > 0) {
        exceeded = true;
      }

      // reset usage information for the next week
      newUsage[tag].notified = false;
      newUsage[tag].used = 0;
    }
  }

  if (hasTag) {
    storage.usage = newUsage;
    completeStorage[account] = storage;
    await setPersistentStorage(storage);
  }

  return exceeded;
};

export const updateAmount = async (account: string, completeStorage: any) => {
  // TODO: do not expose API key
  const response = await fetch(
    `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=9999999999&sort=asc&apikey=1G563FEP4GAUAF4YUXJUBU363NB984HCWJ`,
  );
  const result = await response.json();

  if (!result.result) {
    return null;
  }

  let transactions = result.result;
  if (transactions.length === 0) {
    return null;
  }

  // sort in descending order
  transactions = transactions.sort(
    (a: any, b: any) => b.timeStamp - a.timeStamp,
  );

  const { latestHash } = completeStorage[account];

  if (transactions[0].hash === latestHash) {
    return null;
  }

  for (const transaction of transactions) {
    if (transaction.hash === latestHash) {
      break;
    }

    if (transaction.to !== account) {
      const toAddress = transaction.to;
      const tag = completeStorage[account].mainMapping[toAddress];

      if (tag !== null && tag !== undefined) {
        const gas =
          parseInt(transaction.gasPrice, 10) *
          parseInt(transaction.gasUsed, 10);
        const value = parseInt(transaction.value, 10);
        const total = gas + value;

        completeStorage[account].usage[tag].used += total;
      }
    }
  }

  completeStorage[account].latestHash = transactions[0].hash;

  return completeStorage;
};
