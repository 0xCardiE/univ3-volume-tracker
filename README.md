# Uniswap V3 Token Volumes Tracker

A Next.js application that displays daily trading volumes for Uniswap V3 pairs using The Graph's subgraph API.

## Features

- 📊 View daily trading volumes for any Uniswap V3 pair
- 💰 Display volume in USD, Token0, and Token1
- 📈 Shows TVL (Total Value Locked) data
- 🔍 Search any pair by contract address
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Real-time data from Uniswap V3 subgraph

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

1. The app loads with a default pair address: `0x5696c2c2fcb7e304a5b9faaec9cd37d369c9d067`
2. Enter any Uniswap V3 pair address in the input field
3. Click "Search" to fetch and display the trading volumes
4. View the last 30 days of trading data in the table

## Data Source

This app uses [The Graph](https://thegraph.com/) to query the Uniswap V3 subgraph on Ethereum mainnet.

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **GraphQL** - Data fetching
- **The Graph** - Decentralized indexing protocol

## License

MIT

