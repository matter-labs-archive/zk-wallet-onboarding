# Onboard

A package for authorization over web3 & wallet-connect initialy created by the Blocknative and humbly forked to become a part of zkSync mighty quest.

## Install

`yarn add bnc-onboard`

## Quick Start

```javascript
import Onboard from 'bnc-onboard'
import Web3 from 'web3'

// set a variable to store instantiated web3
let web3

// head to blocknative.com to create a key
const BLOCKNATIVE_KEY = 'blocknative-api-key'

// the network id that your dapp runs on
const NETWORK_ID = 1

// initialize onboard
const onboard = Onboard({
  dappId: BLOCKNATIVE_KEY,
  networkId: NETWORK_ID,
  subscriptions: {
    wallet: wallet => {
      // instantiate web3 when the user has selected a wallet
      web3 = new Web3(wallet.provider)
      console.log(`${wallet.name} connected!`)
    }
  }
})

// Prompt user to select a wallet
await onboard.walletSelect()

// Run wallet checks to make sure that user is ready to transact
await onboard.walletCheck()
```

## Documentation

Lack details? Check [zksync.io dev docs](http://zksync.io/dev)

## Initial authorship

[_Blocknative inc. 2020_]()