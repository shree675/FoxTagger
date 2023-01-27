import { getPersistentStorage, setPersistentStorage } from './utils/functions';
import { LIMIT_ALERT_FOOTER, LIMIT_ALERT_HEADER } from './utils/constants';

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
