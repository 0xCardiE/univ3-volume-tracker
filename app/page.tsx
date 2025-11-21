'use client'

import { useState, useEffect } from 'react'
import { VolumeTable } from './components/VolumeTable'

type NetworkType = 'ethereum' | 'ethereum-v2' | 'gnosis' | 'base'

const DEFAULT_GRAPH_API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY || ''
const UNISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_UNISWAP_V3_SUBGRAPH_ID || '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbataBQdd4'
const UNISWAP_V2_SUBGRAPH_ID = process.env.NEXT_PUBLIC_UNISWAP_V2_SUBGRAPH_ID || 'A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum'
const GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_GNOSIS_SUSHISWAP_V3_SUBGRAPH_ID || 'GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW'
const BASE_UNISWAP_V3_SUBGRAPH_ID = process.env.NEXT_PUBLIC_BASE_UNISWAP_V3_SUBGRAPH_ID || '43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG'

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('ethereum')
  const [pairAddress, setPairAddress] = useState('')
  const [searchedAddress, setSearchedAddress] = useState('')
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [tempApiKey, setTempApiKey] = useState('')
  
  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('graph_api_key')
    if (savedKey) {
      setApiKey(savedKey)
    } else {
      setApiKey(DEFAULT_GRAPH_API_KEY)
    }
  }, [])

  const handleSaveApiKey = () => {
    localStorage.setItem('graph_api_key', tempApiKey)
    setApiKey(tempApiKey)
    setShowConfigModal(false)
  }

  const handleOpenConfig = () => {
    setTempApiKey(apiKey)
    setShowConfigModal(true)
  }

  const GRAPH_API_KEY = apiKey || DEFAULT_GRAPH_API_KEY

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
        {/* Config Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleOpenConfig}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition-all duration-200"
            title="Configure API Key"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium">API Settings</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Universal Uniswap Volume Tracker
          </h1>
          <p className="text-gray-300 text-lg">
            Track daily trading volumes for any Uniswap pair (V2 & V3) across multiple chains
          </p>
        </div>

        {/* Config Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    The Graph API Configuration
                  </h2>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* API Key Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    The Graph API Key
                  </label>
                  <input
                    type="text"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Your API key is stored locally in your browser and never sent to any server except The Graph.
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to get your API Key
                  </h3>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li className="flex gap-2">
                      <span className="font-bold text-pink-400">1.</span>
                      <span>Visit <a href="https://thegraph.com/studio/apikeys/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">thegraph.com/studio/apikeys/</a></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-pink-400">2.</span>
                      <span>Create an account or sign in with your wallet</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-pink-400">3.</span>
                      <span>Click "Create API Key" button</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-pink-400">4.</span>
                      <span>Give it a name (e.g., "Volume Tracker")</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-pink-400">5.</span>
                      <span>Copy the API key and paste it above</span>
                    </li>
                  </ol>
                </div>

                {/* Visual Guide */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    What it looks like:
                  </h3>
                  <div className="bg-gray-950 border border-gray-700 rounded p-3 font-mono text-xs text-gray-400">
                    <div className="mb-2 text-gray-500">// On The Graph Studio API Keys page, you'll see:</div>
                    <div className="text-green-400">✓ Active API Key</div>
                    <div className="mt-1 p-2 bg-gray-900 rounded border border-gray-700">
                      <div className="text-gray-500 text-[10px] mb-1">KEY NAME</div>
                      <div className="text-white">Your-API-Key-Name</div>
                      <div className="text-gray-500 text-[10px] mt-2 mb-1">API KEY</div>
                      <div className="text-blue-400">abc123def456... [Copy Button]</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveApiKey}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg text-white font-medium shadow-lg transition-all duration-200"
                  >
                    Save API Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

