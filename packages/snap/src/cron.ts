import { getPersistentStorage, setPersistentStorage } from './utils/functions';
import { LIMIT_ALERT_FOOTER, LIMIT_ALERT_HEADER } from './utils/constants';

export const checkLimits = async () => {
  let storage = (await getPersistentStorage()) as any;

  if (!storage || !storage.usage) {
    return null;
  }

  const usage = storage.usage;
  let tags: string[] = [];
  let newUsage: any = {};
  let changed = false;

  for (var tag in usage) {
    if (usage.hasOwnProperty(tag)) {
      var used = usage[tag].used;
      var limit = usage[tag].limit;
      var notified = usage[tag].notified;

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
    for (tag of tags) {
      message += tag + '\n';
    }
    message += LIMIT_ALERT_FOOTER;

    return message;
  } else {
    return null;
  }
};
