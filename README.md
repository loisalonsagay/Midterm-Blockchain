# TipPost - Pay-to-Like Social dApp

A blockchain-based social platform where users can create posts with images and tip creators with real ETH on the Sepolia testnet.

## Features

**MetaMask Wallet Integration** - Connect your wallet and sign transactions  
**Post Creation** - Create posts with image URLs and captions  
**Like/Tip System** - Like posts for 0.0001 ETH, ETH transfers directly to creators  
**Real-Time Feed** - Events update the feed instantly  
**Earnings Dashboard** - Track total ETH earned from tips  
**Network Guard** - Automatic Sepolia network detection and switching  
**Double-Like Protection** - Prevent users from liking the same post twice  
**Self-Like Prevention** - Users cannot like their own posts

## Tech Stack

- **Smart Contract:** Solidity ^0.8.20
- **Frontend:** React 19 + TypeScript + Vite
- **Blockchain Interaction:** ethers.js v6
- **Wallet:** MetaMask
- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **Hosting:** Vercel/Netlify (ready for deployment)

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia testnet ETH (free from faucets)

### Installation

```bash
git clone https://github.com/loisalonsagay/Midterm-Blockchain.git
cd Midterm-Blockchain
npm install
```

### Compile & Test
```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.cjs --network sepolia
npm run dev
```

### Deployed Links
Live Frontend: https://midterm-blockchain.vercel.app
Contract Address (Sepolia): 0x8bD9541B949449adeA05a5d1d07B5a630F487a82
Etherscan: https://sepolia.etherscan.io/address/0x8bD9541B949449adeA05a5d1d07B5a630F487a82