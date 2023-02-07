import { BigNumber } from 'ethers';
import { compact, setPersistentStorage } from './utils/functions';
import { LIMIT_ALERT_HEADER } from './utils/constants';

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

      if (
        !notified &&
        BigNumber.from(used).gt(BigNumber.from(limit)) &&
        BigNumber.from(limit).gt(BigNumber.from('0'))
      ) {
        tags.push(tag);
        newUsage[tag].notified = true;
      }
    }
  }

  if (tags.length > 0) {
    storage.usage = newUsage;
    completeStorage[account] = storage;
    await setPersistentStorage(completeStorage);

    // let message = `${LIMIT_ALERT_HEADER + compact(account)}:\n`;
    const message = `${LIMIT_ALERT_HEADER + tags.length} tags on ${compact(
      account,
    )}`;
    // for (const tag of tags) {
    //   message += `${tag},\n`;
    // }
    // message += LIMIT_ALERT_FOOTER;

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

      if (
        BigNumber.from(used).gt(BigNumber.from(limit)) &&
        BigNumber.from(limit).gt('0')
      ) {
        exceeded = true;
      }

      // reset usage information for the next week
      newUsage[tag].notified = false;
      newUsage[tag].used = '0';
    }
  }

  if (hasTag) {
    storage.usage = newUsage;
    completeStorage[account] = storage;
    await setPersistentStorage(completeStorage);
  }

  return exceeded;
};

export const updateAmount = async (account: string, completeStorage: any) => {
  const response = await fetch(
    `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=9999999999&sort=asc&apikey=UQUAAVHP952XT8JHMTIPDAHUJYYDVJPUGK`,
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
  const { prevHash } = completeStorage[account];

  if (transactions[0].hash.toLowerCase() === latestHash) {
    return null;
  }

  for (const transaction of transactions) {
    if (transaction.hash.toLowerCase() === latestHash) {
      break;
    }

    if (transaction.to !== account) {
      const toAddress = (transaction.to as string).toLowerCase();
      const tagList = completeStorage[account].mainMapping[toAddress];

      if (tagList !== null && tagList !== undefined) {
        for (const tag of tagList) {
          const gas = BigNumber.from(transaction.gasPrice).mul(
            BigNumber.from(transaction.gasUsed),
          );
          const value = BigNumber.from(transaction.value);
          const total = gas.add(value);
          if (prevHash !== latestHash) {
            completeStorage[account].usage[tag].used = BigNumber.from(
              completeStorage[account].usage[tag].used,
            )
              .add(total)
              .toString();
          } else {
            completeStorage[account].usage[tag].used = BigNumber.from('0')
              .add(total)
              .toString();
          }
        }
      }
    }
  }

  completeStorage[account].prevHash = latestHash;
  completeStorage[account].latestHash = transactions[0].hash.toLowerCase();

  return completeStorage;
};
