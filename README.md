# WKAIA - Wrapped Kaia Token

A Hardhat project for the WKAIA (Wrapped Kaia) smart contract, which is an ERC-20 compatible wrapped token that allows users to deposit and withdraw native Kaia tokens.

## Overview

WKAIA is a wrapped token contract similar to WETH (Wrapped Ether) that:
- Accepts native Kaia deposits and mints WKAIA tokens
- Allows users to burn WKAIA tokens and withdraw native Kaia
- Implements standard ERC-20 functionality (transfer, approve, transferFrom)
- Maintains a 1:1 backing ratio with native Kaia tokens

## Features

- **Deposit**: Send native Kaia to receive WKAIA tokens
- **Withdraw**: Burn WKAIA tokens to receive native Kaia
- **ERC-20 Compliance**: Full ERC-20 token standard implementation
- **Gas Optimized**: Efficient contract design with reasonable gas usage
- **Comprehensive Testing**: Full test coverage for all functions
- **Deployment Scripts**: Ready-to-use deployment and verification scripts

## Project Structure

```
canonical-wkaia/
├── contracts/
│   └── WKAIA.sol          # Main smart contract
├── test/
│   └── WKAIA.test.js      # Comprehensive test suite
├── scripts/
│   └── deploy.js          # Deployment script
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Dependencies and scripts
├── env.example            # Environment variables template
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canonical-wkaia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

## Configuration

### Solidity Version

This project uses **Solidity 0.5.17** to maintain compatibility with the original WKAIA contract implementation, including support for the legacy fallback function syntax.

### Environment Variables

Create a `.env` file based on `env.example`:

- `PRIVATE_KEY`: Your deployment wallet private key
- `REPORT_GAS`: Enable gas reporting (true/false)

### Networks

The project is configured for:
- **Hardhat Network**: Local development and testing
- **Kairos Testnet**: Kaia testnet (ChainID: 1001)
- **Kaia Mainnet**: Kaia production network (ChainID: 8217)

## Usage

### Compilation

```bash
npm run compile
```

### Testing

```bash
# Run all tests
npm test

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/WKAIA.test.js
```

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to local network (in another terminal)
npm run deploy
```

### Deployment

```bash
# Deploy to local network
npm run deploy

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```



## Smart Contract Functions

### Core Functions

- `deposit()`: Deposit native Kaia and receive WKAIA tokens
- `withdraw(uint256 wad)`: Burn WKAIA tokens and receive native Kaia
- `totalSupply()`: Get total WKAIA supply (backed by contract balance)

### ERC-20 Functions

- `transfer(address dst, uint256 wad)`: Transfer WKAIA tokens
- `approve(address guy, uint256 wad)`: Approve spending allowance
- `transferFrom(address src, address dst, uint256 wad)`: Transfer from approved address
- `balanceOf(address guy)`: Get token balance
- `allowance(address src, address guy)`: Get spending allowance

### Events

- `Deposit(address indexed dst, uint256 wad)`: Emitted on deposit
- `Withdrawal(address indexed src, uint256 wad)`: Emitted on withdrawal
- `Transfer(address indexed src, address indexed dst, uint256 wad)`: Emitted on transfer
- `Approval(address indexed src, address indexed guy, uint256 wad)`: Emitted on approval

## Testing

The test suite covers:

- ✅ Contract deployment and initialization
- ✅ Deposit functionality (direct and via fallback function)
- ✅ Withdrawal functionality
- ✅ Transfer operations
- ✅ Approval and transferFrom
- ✅ Edge cases and error conditions
- ✅ Gas optimization verification

Run tests with:
```bash
npm test
```

## Deployed contract addresses

- Kaia Mainnet: [0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432](https://kaiascan.io/account/0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432?tabId=internalTx)
- Kairos Testnet: [0x043c471bEe060e00A56CcD02c0Ca286808a5A436](https://kairos.kaiascan.io/account/0x043c471bEe060e00A56CcD02c0Ca286808a5A436?tabId=internalTx)

> The contracts are deployed with [canonical-wklay](https://github.com/klaytn/canonical-wklay) and renamed to wkaia as part of the KAIA Foundation migration.

## Support

For questions or support, please open an issue on the repository.

