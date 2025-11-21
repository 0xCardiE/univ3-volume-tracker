# Swarm Token Volumes Tracker

A Next.js application that tracks and displays daily trading volumes for the Swarm (BZZ) token on Ethereum and Gnosis networks. This dApp specifically monitors Swarm token trading activity across Uniswap V3 pairs on both networks.

## Features

- 📊 View daily trading volumes for Swarm (BZZ) token pairs
- 💰 Display volume in USD, Token0, and Token1
- 📈 Shows TVL (Total Value Locked) data
- 🔍 Track Swarm token on both Ethereum and Gnosis networks
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Real-time data from Uniswap V3 subgraphs

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

This application is specifically designed to track the Swarm (BZZ) token trading volumes on Ethereum and Gnosis networks.

1. The app loads with the default Swarm token pair address
2. View the last 30 days of trading data for Swarm token
3. Monitor trading activity across both Ethereum and Gnosis networks

## Data Source

This app uses [The Graph](https://thegraph.com/) to query the Uniswap V3 subgraphs on both Ethereum mainnet and Gnosis network, specifically tracking Swarm (BZZ) token pairs.

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GraphQL** - Data fetching
- **The Graph** - Decentralized indexing protocol

## License

MIT

