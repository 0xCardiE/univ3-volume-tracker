'use client'

import { useEffect, useState } from 'react'
import { fetchTrendingPools, type TrendingPool } from '../utils/coingecko'

interface TrendingPoolsProps {
  apiKey: string
  onSelectPool: (address: string, network: string, dexId: string) => void
}

export function TrendingPools({ apiKey, onSelectPool }: TrendingPoolsProps) {
  const [pools, setPools] = useState<TrendingPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPools = async () => {
      if (!apiKey) {
        setError('CoinGecko API key not configured')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        const data = await fetchTrendingPools(apiKey)
        setPools(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending pools')
      } finally {
        setLoading(false)
      }
    }

    loadPools()
  }, [apiKey])

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '$0'
    
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const getNetworkName = (network: string) => {
    const networkMap: Record<string, string> = {
      'eth': 'Ethereum',
      'base': 'Base',
      'gno': 'Gnosis',
      'arbitrum': 'Arbitrum',
      'bsc': 'BNB Chain',
      'polygon': 'Polygon',
      'optimism': 'Optimism',
      'avalanche': 'Avalanche',
      'solana': 'Solana',
    }
    return networkMap[network] || network.toUpperCase()
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-300 text-lg">Loading trending pools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-red-500/30">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-red-400">Error Loading Trending Pools</h3>
        </div>
        <p className="text-red-200">{error}</p>
        <p className="text-red-300 text-sm mt-2">Make sure you have configured your CoinGecko API key in settings.</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trending Pools (24h)
        </h2>
        <p className="text-gray-300 text-sm">Click on any pool to view detailed volume data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {pools.map((pool) => (
          <button
            key={pool.id}
            onClick={() => onSelectPool(pool.address, pool.network, pool.dexId || '')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 rounded-xl p-4 transition-all duration-200 text-left group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {pool.baseToken.imageUrl && (
                    <img 
                      src={pool.baseToken.imageUrl} 
                      alt={pool.baseToken.symbol}
                      className="w-8 h-8 rounded-full border-2 border-gray-900"
                    />
                  )}
                  {pool.quoteToken.imageUrl && (
                    <img 
                      src={pool.quoteToken.imageUrl} 
                      alt={pool.quoteToken.symbol}
                      className="w-8 h-8 rounded-full border-2 border-gray-900"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-pink-400 transition-colors">
                    {pool.baseToken.symbol} / {pool.quoteToken.symbol}
                  </h3>
                  <p className="text-gray-400 text-xs">{pool.name}</p>
                </div>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded ${
                parseFloat(pool.priceChangePercentage24h) >= 0 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {parseFloat(pool.priceChangePercentage24h) >= 0 ? '+' : ''}
                {parseFloat(pool.priceChangePercentage24h).toFixed(2)}%
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">24h Volume</span>
                <span className="text-white font-semibold text-sm">{formatNumber(pool.volumeUsd24h)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Liquidity</span>
                <span className="text-gray-300 text-sm">{formatNumber(pool.reserveInUsd)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">24h Transactions</span>
                <span className="text-gray-300 text-sm">
                  <span className="text-green-400">{pool.transactions24h.buys}</span> / 
                  <span className="text-red-400"> {pool.transactions24h.sells}</span>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">{getNetworkName(pool.network)}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-xs capitalize">{pool.dex.replace('_', ' ')}</span>
              </div>
              <svg className="w-4 h-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {pools.length === 0 && (
        <div className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Trending Pools</h3>
          <p className="text-gray-400">No trending pools available at the moment.</p>
        </div>
      )}
    </div>
  )
}

