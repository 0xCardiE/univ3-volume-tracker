'use client'

import { useState } from 'react'
import { VolumeTable } from './components/VolumeTable'

type NetworkType = 'ethereum' | 'ethereum-v2' | 'gnosis' | 'base'

const GRAPH_API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY || ''
const UNISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_UNISWAP_V3_SUBGRAPH_ID || '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbataBQdd4'
const UNISWAP_V2_SUBGRAPH_ID = process.env.NEXT_PUBLIC_UNISWAP_V2_SUBGRAPH_ID || 'A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum'
const GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID || 'GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW'
const BASE_UNISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_BASE_UNISWAP_V3_SUBGRAPH_ID || '43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG'

const NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    dex: 'Uniswap V3',
    subgraphUrl: `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V3_SUBGRAPH_ID}`,
    chainId: '1',
    explorerUrl: 'https://etherscan.io',
  },
  'ethereum-v2': {
    name: 'Ethereum',
    dex: 'Uniswap V2',
    subgraphUrl: `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V2_SUBGRAPH_ID}`,
    chainId: '1',
    explorerUrl: 'https://etherscan.io',
  },
  gnosis: {
    name: 'Gnosis',
    dex: 'SushiSwap V3',
    subgraphUrl: `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID}`,
    chainId: '100',
    explorerUrl: 'https://gnosisscan.io',
  },
  base: {
    name: 'Base',
    dex: 'Uniswap V3',
    subgraphUrl: `https://gateway.thegraph.com/api/${GRAPH_API_KEY}/subgraphs/id/${BASE_UNISWAP_V3_SUBGRAPH_ID}`,
    chainId: '8453',
    explorerUrl: 'https://basescan.org',
  },
}

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('ethereum')
  const [pairAddress, setPairAddress] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  
  const currentNetwork = NETWORKS[selectedNetwork]

  const handleSearch = () => {
    if (pairAddress.trim()) {
      setSearchedAddress(pairAddress.trim().toLowerCase())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Universal Uniswap Volume Tracker
          </h1>
          <p className="text-gray-300 text-lg">
            Track daily trading volumes for any Uniswap pair (V2 & V3) across multiple chains
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Network
            </label>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setSelectedNetwork('ethereum')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedNetwork === 'ethereum'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">{NETWORKS.ethereum.name}</span>
                  <span className="text-xs opacity-75">{NETWORKS.ethereum.dex}</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedNetwork('ethereum-v2')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedNetwork === 'ethereum-v2'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">{NETWORKS['ethereum-v2'].name}</span>
                  <span className="text-xs opacity-75">{NETWORKS['ethereum-v2'].dex}</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedNetwork('gnosis')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedNetwork === 'gnosis'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">{NETWORKS.gnosis.name}</span>
                  <span className="text-xs opacity-75">{NETWORKS.gnosis.dex}</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedNetwork('base')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedNetwork === 'base'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">{NETWORKS.base.name}</span>
                  <span className="text-xs opacity-75">{NETWORKS.base.dex}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Enter Pair Contract Address
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0x..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={!pairAddress.trim()}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Enter a Uniswap pair contract address to view its trading volume history
            </p>
          </div>
        </div>

        {searchedAddress && (
          <VolumeTable 
            key={`${selectedNetwork}-${searchedAddress}`}
            pairAddress={searchedAddress}
            subgraphUrl={currentNetwork.subgraphUrl}
            chainId={currentNetwork.chainId}
            explorerUrl={currentNetwork.explorerUrl}
          />
        )}

        {!searchedAddress && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Pair Selected</h3>
              <p className="text-gray-400">Enter a pair contract address above to view trading data</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

