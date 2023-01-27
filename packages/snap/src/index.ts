import {
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnCronjobHandler,
} from '@metamask/snap-types';
import { checkLimits, getSummary } from './cron';
import { getDetails } from './transaction';
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
      return await wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inApp',
            message: `Hello, world!`,
          },
        ],
      });
    case 'getPersistentStorage':
      return await getPersistentStorage();
    case 'setPersistentStorage':
      await setPersistentStorage(
        request.params as void | Record<string, unknown>,
      );
      return null;
    case 'clearPersistentStorage':
      await wallet.request({
        method: 'snap_manageState',
        params: ['clear'],
      });
      return null;

    default:
      throw new Error('Method not found.');
  }
};

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const insights = await getDetails(transaction);

  return {
    insights,
  };
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'walletSummary':
    case 'checkLimits': {
      const completeStorage = (await getPersistentStorage()) as any;

      if (!completeStorage) {
        return;
      }

      const accounts: string[] = [];

      for (const account in completeStorage) {
        if (Object.prototype.hasOwnProperty.call(completeStorage, account)) {
          if (account.startsWith('0x')) {
            accounts.push(account);
          }
        }
      }

      for (const account of accounts) {
        const message =
          request.method === 'checkLimits'
            ? await checkLimits(account, completeStorage)
            : await getSummary(account, completeStorage);
        if (message !== null && message !== undefined) {
          wallet.request({
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

    default:
      throw new Error('Method not found.');
  }
};
