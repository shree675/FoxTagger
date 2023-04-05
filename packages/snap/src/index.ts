import {
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnCronjobHandler,
} from '@metamask/snaps-types';
import { checkLimits, getSummary, updateAmount } from './cron';
import { getDetails } from './transaction';
import { SUMMARY_EXCEEDED, SUMMARY_SAFE_FOOTER } from './utils/constants';
import { getPersistentStorage, setPersistentStorage } from './utils/functions';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'notify':
      // for debugging
      return await snap.request({
        method: 'snap_notify',
        params: {
          type: 'inApp',
          message: `He\nllo,\r\nwo<br />rld!`,
        },
      });
    case 'getPersistentStorage':
      return await getPersistentStorage();
    case 'setPersistentStorage':
      await setPersistentStorage(
        request.params as void | Record<string, unknown>,
      );
      return null;
    case 'clearPersistentStorage':
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'clear' },
      });
      return null;

    default:
      throw new Error('Method not found.');
  }
};

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const insights = await getDetails(transaction);

  return insights;
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'weeklySummary': {
      const completeStorage = (await getPersistentStorage()) as any;

      if (!completeStorage) {
        return;
      }

      const accounts: string[] = [];

      for (const account in completeStorage) {
        if (Object.prototype.hasOwnProperty.call(completeStorage, account)) {
          if (account.startsWith('0x')) {
            accounts.push(account.toLowerCase());
          }
        }
      }

      let message = '';
      let num = 0;

      for (const account of accounts) {
        const exceeded = await getSummary(account, completeStorage);

        if (exceeded) {
          num += 1;
        }
      }

      if (num > 0) {
        message += `${SUMMARY_EXCEEDED + num} accounts`;
      } else {
        message += SUMMARY_SAFE_FOOTER;
      }
      message = message.substring(0, 49);

      if (message !== '') {
        await snap.request({
          method: 'snap_notify',
          params: [
            {
              type: 'inApp',
              message,
            },
          ],
        });
      }

      return;
    }

    case 'checkLimits': {
      const completeStorage = (await getPersistentStorage()) as any;

      if (!completeStorage) {
        return;
      }

      const accounts: string[] = [];

      for (const account in completeStorage) {
        if (Object.prototype.hasOwnProperty.call(completeStorage, account)) {
          if (account.startsWith('0x')) {
            accounts.push(account.toLowerCase());
          }
        }
      }

      for (const account of accounts) {
        let message = await checkLimits(account, completeStorage);
        if (message !== null && message !== undefined) {
          message = message.substring(0, 49);

          await snap.request({
            method: 'snap_notify',
            params: [
              {
                type: 'inApp',
                message,
              },
            ],
          });
        }
      }
      return;
    }

    case 'updateAmount': {
      let completeStorage = (await getPersistentStorage()) as any;
      if (!completeStorage) {
        return;
      }

      const accounts: string[] = [];

      for (const account in completeStorage) {
        if (Object.prototype.hasOwnProperty.call(completeStorage, account)) {
          if (account.startsWith('0x')) {
            accounts.push(account.toLowerCase());
          }
        }
      }

      for (const account of accounts) {
        const tempStorage = await updateAmount(account, completeStorage);
        if (tempStorage !== undefined && tempStorage !== null) {
          completeStorage = tempStorage;
        }
      }

      await setPersistentStorage(completeStorage);
      return;
    }

    default:
      throw new Error('Method not found.');
  }
};
