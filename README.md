# FoxTagger

Team ID: 57

> **Note**  
> Please refer to [final-latest](https://github.com/shree675/FoxTagger/tree/final-latest) branch to view and use the snap that is in accordance with [#21](https://github.com/MetaMask/template-snap-monorepo/pull/21) on the [official repo](https://github.com/MetaMask/template-snap-monorepo).

## About Project
FoxTagger is a Metamask snaps extension that facilitates the mapping of addresses with user defined tags to help users keep their expenditure in check by alerting and displaying usage analytics.  
It also hosts a *request amount* feature that sends notifications to the other user.

## Motivation
Since cryptocurrency usage through Metamask is expected to increase many-fold in the coming years, it is important to make the users more mindful about their Ethereum chain transactions by keeping track of their expenditure through tagging and organization based on tags. Hence, this app provides exactly that, a platform where the users can check their expenditure and accordingly reflect upon it.

## Getting Started

* Clone this repository.
* Run the below:
```shell
yarn prep
yarn install && yarn start
```
* The web app spins up at https://localhost:8000 and the snaps runs at https://localhost:8080.
* Open the web app and connect the wallet.
* The app is now ready for use.

The request amount feature can be accessed at https://localhost:8000/request.

## Features of Snaps Being Used
* Persistence storage
* Notifications
* Cron jobs
* Transaction insights

## Notes

- Babel is used for transpiling TypeScript to JavaScript, so when building with the CLI,
  `transpilationMode` must be set to `localOnly` (default) or `localAndDeps`.
- For the global `wallet` type to work, you have to add the following to your `tsconfig.json`:
  ```json
  {
    "files": ["./node_modules/@metamask/snap-types/global.d.ts"]
  }
  ```
