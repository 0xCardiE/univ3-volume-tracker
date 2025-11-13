'use client'

import { useState } from 'react'
import { VolumeTable } from './components/VolumeTable'

type PoolType = 'ethereum' | 'gnosis'

const GRAPH_API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY || ''
const UNISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_UNISWAP_V3_SUBGRAPH_ID || '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbataBQdd4'
const GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID || 'GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW'

const POOLS = {
  ethereum: {
    address: '0x5696c2c2fcb7e304a5b9faaec9cd37d369c9d067',
    name: 'Ethereum',
    dex: 'Uniswap V3',
    subgraphUrl: `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V3_SUBGRAPH_ID}`,
    chainId: '1',
    explorerUrl: 'https://etherscan.io',
  },
  gnosis: {
    address: '0x6f30b7cf40cb423c1d23478a9855701ecf43931e',
    name: 'Gnosis',
    dex: 'SushiSwap V3',
    subgraphUrl: `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID}`,
    chainId: '100',
    explorerUrl: 'https://gnosisscan.io',
  },
}

export default function Home() {
  const [selectedPool, setSelectedPool] = useState<PoolType>('ethereum')
  
  const currentPool = POOLS[selectedPool]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pool Volume Tracker
          </h1>
          <p className="text-gray-300 text-lg">
            Track daily trading volumes across chains
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setSelectedPool('ethereum')}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                selectedPool === 'ethereum'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg">{POOLS.ethereum.name}</span>
                <span className="text-xs opacity-75">{POOLS.ethereum.dex}</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedPool('gnosis')}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                selectedPool === 'gnosis'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg">{POOLS.gnosis.name}</span>
                <span className="text-xs opacity-75">{POOLS.gnosis.dex}</span>
              </div>
            </button>
          </div>
        </div>

        <VolumeTable 
          pairAddress={currentPool.address}
          subgraphUrl={currentPool.subgraphUrl}
          chainId={currentPool.chainId}
          explorerUrl={currentPool.explorerUrl}
        />
      </div>
    </main>
  )
}

