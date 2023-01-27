import {
  getPersistentStorage,
  setPersistentStorage,
  toEth,
} from './utils/functions';
import {
  LIMIT_ALERT_FOOTER,
  LIMIT_ALERT_HEADER,
  SUMMARY_FOOTER,
  SUMMARY_HEADER,
} from './utils/constants';

export const checkLimits = async () => {
  const storage = (await getPersistentStorage()) as any;

  if (!storage?.usage) {
    return null;
  }

  const { usage } = storage;
  const tags: string[] = [];
  const newUsage: any = {};
  let changed = false;

  for (const tag in usage) {
    if (Object.prototype.hasOwnProperty.call(usage, tag)) {
      const { used } = usage[tag];
      const { limit } = usage[tag];
      const { notified } = usage[tag];

      newUsage[tag] = usage[tag];

      if (!notified && used > limit) {
        tags.push(tag);
        newUsage[tag].notified = true;
        changed = true;
      }
    }
  }

  if (changed) {
    storage.usage = newUsage;
    await setPersistentStorage(storage);

    let message = LIMIT_ALERT_HEADER;
    for (const tag of tags) {
      message += `${tag}\n`;
    }
    message += LIMIT_ALERT_FOOTER;

    return message;
  }
  return null;
};

export const getSummary = async () => {
  const storage = (await getPersistentStorage()) as any;

  if (!storage?.usage) {
    return null;
  }

  const { usage } = storage;
  const summary: { tag: string; used: string }[] = [];
  const newUsage: any = {};

  for (const tag in usage) {
    if (Object.prototype.hasOwnProperty.call(usage, tag)) {
      const { used } = usage[tag];

      newUsage[tag] = usage[tag];

      summary.push({ tag, used: toEth(used) });
    }
  }

  if (summary.length > 0) {
    let message = SUMMARY_HEADER;
    for (const item of summary) {
      message += `${item.tag}: ${item.used}\n`;
    }
    message += SUMMARY_FOOTER;

    // reset usage information for the next week
    for (const tag in newUsage) {
      if (Object.prototype.hasOwnProperty.call(newUsage, tag)) {
        newUsage[tag].notified = false;
        newUsage[tag].used = 0;
      }
    }

    storage.usage = newUsage;
    await setPersistentStorage(storage);

    return message;
  }

  return null;
};
