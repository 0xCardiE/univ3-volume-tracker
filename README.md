# Universal Uniswap Volume Tracker

A Next.js application that tracks and displays daily trading volumes for any Uniswap pair (V2 & V3) across multiple blockchain networks. This universal dApp allows you to monitor any token pair's trading activity on Ethereum, Gnosis, and Base networks.

## Features

- 📊 View daily trading volumes for any Uniswap pair (V2 & V3)
- 🌐 Multi-chain support: Ethereum (V2 & V3), Gnosis (SushiSwap V3), and Base
- 💰 Display volume in USD, Token0, and Token1
- 📈 Shows TVL (Total Value Locked) data
- 🔍 Search any pair by contract address
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Real-time data from The Graph subgraphs

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. Select your preferred network and DEX version
2. Enter any Uniswap pair contract address
3. Click "Search" to fetch and display trading data
4. View detailed trading volumes, fees, TVL, and transaction counts
5. Analyze historical price charts and metrics

## Supported Networks & DEXs

- **Ethereum** - Uniswap V3 pairs on Ethereum mainnet
- **Ethereum** - Uniswap V2 pairs on Ethereum mainnet
- **Gnosis** - SushiSwap V3 pairs on Gnosis Chain
- **Base** - Uniswap V3 pairs on Base network

## Data Source

This app uses [The Graph](https://thegraph.com/) to query Uniswap V2/V3 subgraphs across multiple networks, providing real-time and historical trading data for any pair.

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GraphQL** - Data fetching
- **The Graph** - Decentralized indexing protocol

## License

MIT

