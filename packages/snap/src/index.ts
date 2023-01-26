import {
  OnRpcRequestHandler,
  OnTransactionHandler,
  OnCronjobHandler,
} from '@metamask/snap-types';
import { checkLimits } from './cron';
import { getDetails } from './transaction';
import { getPersistentStorage, setPersistentStorage } from './utils/functions';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getPersistentStorage':
      return await getPersistentStorage();
    case 'setPersistentStorage':
      await setPersistentStorage(
        request.params as void | Record<string, unknown>,
      );
      return;

    default:
      throw new Error('Method not found.');
  }
};

/**
 * Intercept ongoing transactions.
 *
 * @param transaction - The transaction details of the ongoing transaction.
 * @returns an 'insights' object.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const insights = await getDetails(transaction);

  return {
    insights: insights,
  };
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'walletSummary':
      return;
    case 'checkLimits':
      const message = await checkLimits();
      if (message !== null && message !== undefined) {
        return wallet.request({
          method: 'snap_notify',
          params: [
            {
              type: 'inApp',
              message: message,
            },
          ],
        });
      }
      return;
    default:
      throw new Error('Method not found.');
  }
};
