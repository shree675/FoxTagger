# Snap

## Notes

- Babel is used for transpiling TypeScript to JavaScript, so when building with the CLI,
  `transpilationMode` must be set to `localOnly` (default) or `localAndDeps`.
- For the global `wallet` type to work, you have to add the following to your `tsconfig.json`:
  ```json
  {
    "files": ["./node_modules/@metamask/snap-types/global.d.ts"]
  }
  ```
- The current data structure of the persistent storage is as follows:
  ```json
  {
    "from_account0": {
      mainMapping: {
        "to_account0": "tag0",
        ...
      },
      usage: {
        "tag0": {
          limit: 100000000000,
          used: 800000,
          notified: false
        },
        ...
      },
      latestHash: "transaction_hash0"
    },
    ...
  }
  ```
- The usage information must be stored in _wei_.
- The mapping of account to tag will be the same for all user accounts. Only the limits must be set by the user for each of his accounts.
- The same notifications are globally shared between all accounts on Metamask.
- The corresponding amounts of new transactions are updated every 30 minutes in the persistent storage.
- All hashes/addresses must be in **lower case** hexadecimal format.
