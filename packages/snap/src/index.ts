import {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from "@metamask/snap-types";

import { storeDetails } from "./details";

/**
 * Get a message from the origin. For demonstration purposes only.
 *
 * @param originString - The origin string.
 * @returns A message based on the origin.
 */
export const getMessage = (originString: string): string =>
  `Hello, ${originString}!`;

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
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case "hello":
      return wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: getMessage(origin),
            description:
              "This custom confirmation is just for display purposes.",
            textAreaContent:
              "But you can edit the snap source code to make it do something, if you want to!",
          },
        ],
      });
    case "notify":
      return wallet.request({
        method: "snap_notify",
        params: [
          {
            type: "inApp",
            message: `Hello, world!`,
          },
        ],
      });
    default:
      throw new Error("Method not found.");
  }
};

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  return {
    insights: await storeDetails(transaction),
  };
};
