'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fetchPairDayData } from '../utils/uniswap'
import { fetchPoolContractInfo, type PoolContractInfo, setExplorerConfig } from '../utils/etherscan'

interface DayData {
  date: string
  dateTimestamp: number
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  tvlUSD: string
  feesUSD: string
  txCount: string
  open: string
  high: string
  low: string
  close: string
  token0Price: string
  token1Price: string
}

interface VolumeTableProps {
  pairAddress: string
  subgraphUrl: string
  chainId: string
  explorerUrl: string
  dexVersion?: string // Optional: 'v2', 'v3', 'v4'
}

type DayRange = 30 | 60 | 90 | 120 | 365

export function VolumeTable({ pairAddress, subgraphUrl, chainId, explorerUrl, dexVersion }: VolumeTableProps) {
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pairInfo, setPairInfo] = useState<{ 
    token0: string
    token1: string
    token0Name?: string
    token1Name?: string
    totalValueLockedToken0?: string
    totalValueLockedToken1?: string
    totalValueLockedUSD?: string
  } | null>(null)
  const [dayRange, setDayRange] = useState<DayRange>(60)
  const [contractInfo, setContractInfo] = useState<PoolContractInfo | null>(null)
  const [loadingContract, setLoadingContract] = useState(false)
  const [showContractInfo, setShowContractInfo] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      // Reset contract info when changing pools
      setContractInfo(null)
      setShowContractInfo(false)
      
      try {
        // Set the explorer config
        setExplorerConfig(chainId, explorerUrl)
        
        const result = await fetchPairDayData(pairAddress.toLowerCase(), dayRange, subgraphUrl, dexVersion)
        setData(result.dayData)
        setPairInfo(result.pairInfo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    if (pairAddress && subgraphUrl) {
      fetchData()
    }
  }, [pairAddress, dayRange, subgraphUrl, chainId, explorerUrl])

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const formatTokenAmount = (value: string) => {
    const num = parseFloat(value)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(2)
  }

  // Calculate summaries
  const calculateSummaries = () => {
    if (data.length === 0) return null
    
    const totalVolumeUSD = data.reduce((sum, day) => sum + parseFloat(day.volumeUSD), 0)
    const totalVolumeToken0 = data.reduce((sum, day) => sum + parseFloat(day.volumeToken0), 0)
    const totalVolumeToken1 = data.reduce((sum, day) => sum + parseFloat(day.volumeToken1), 0)
    const avgTVL = data.reduce((sum, day) => sum + parseFloat(day.tvlUSD), 0) / data.length
    const totalFees = data.reduce((sum, day) => sum + parseFloat(day.feesUSD || '0'), 0)
    const totalTxCount = data.reduce((sum, day) => sum + parseInt(day.txCount || '0'), 0)
    
    return {
      totalVolumeUSD,
      totalVolumeToken0,
      totalVolumeToken1,
      avgTVL,
      totalFees,
      totalTxCount
    }
  }

  const summaries = calculateSummaries()

  // Determine which token to display in the price chart
  // We want to show the price of the non-stablecoin/non-WETH token
  const getDisplayToken = () => {
    if (!pairInfo) return { token: 'token0', symbol: 'Token0', isToken0: true }
    
    const stableTokens = ['WETH', 'USDC', 'USDT', 'WETH.e', 'USDC.e', 'USDT.e']
    const token0Upper = pairInfo.token0.toUpperCase()
    const token1Upper = pairInfo.token1.toUpperCase()
    
    // Check if token0 is a stablecoin/WETH - if so, show token1
    if (stableTokens.includes(token0Upper)) {
      return { token: 'token1', symbol: pairInfo.token1, isToken0: false }
    }
    
    // Check if token1 is a stablecoin/WETH - if so, show token0
    if (stableTokens.includes(token1Upper)) {
      return { token: 'token0', symbol: pairInfo.token0, isToken0: true }
    }
    
    // Default to token0 if neither is a stablecoin/WETH
    return { token: 'token0', symbol: pairInfo.token0, isToken0: true }
  }

  const displayToken = getDisplayToken()

  const handleFetchContractInfo = async () => {
    if (contractInfo) {
      // Toggle visibility if already loaded
      setShowContractInfo(!showContractInfo)
      return
    }

    setLoadingContract(true)
    try {
      const info = await fetchPoolContractInfo(pairAddress)
      setContractInfo(info)
      setShowContractInfo(true)
    } catch (err) {
      console.error('Failed to fetch contract info:', err)
      alert('Failed to fetch contract info. Make sure you have a valid Etherscan API key.')
    } finally {
      setLoadingContract(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-300 text-lg">Loading volume data...</p>
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
          <h3 className="text-xl font-semibold text-red-400">Error</h3>
        </div>
        <p className="text-red-200">{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Data Found</h3>
          <p className="text-gray-400">No trading volume data available for this pair address.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
      {pairInfo && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white mb-2">
            {pairInfo.token0} / {pairInfo.token1}
          </h2>
          <p className="text-gray-300 text-sm font-mono mb-3">{pairAddress}</p>
          
          {/* Contract Info Button */}
          <button
            onClick={handleFetchContractInfo}
            disabled={loadingContract}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingContract ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading contract info...
              </>
            ) : (
              <>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showContractInfo ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Contract Info (from Etherscan)
              </>
            )}
          </button>

          {/* Collapsible Contract Info */}
          {showContractInfo && contractInfo && (
            <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10 animate-slideDown">
              <h3 className="text-sm font-semibold text-pink-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Contract Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-gray-400 text-xs mb-1">Fee Tier</div>
                  <div className="text-white font-semibold">
                    {contractInfo.feePercentage}%
                  </div>
                  <div className="text-gray-500 text-xs font-mono">Encoded: {contractInfo.fee}</div>
                </div>
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-gray-400 text-xs mb-1">Tick Spacing</div>
                  <div className="text-white font-mono">{contractInfo.tickSpacing}</div>
                </div>
                {data.length > 0 && pairInfo && (
                  <>
                    <div className="md:col-span-2 p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded border border-green-500/30">
                      <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Current Pool Liquidity (TVL)
                      </div>
                      <div className="text-white font-bold text-xl">
                        {pairInfo.totalValueLockedUSD ? formatNumber(pairInfo.totalValueLockedUSD) : formatNumber(data[0].tvlUSD)}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">Last updated: {data[0].date}</div>
                    </div>
                    {pairInfo.totalValueLockedToken0 && pairInfo.totalValueLockedToken1 && (
                      <div className="md:col-span-2 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded border border-blue-500/30">
                        <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Token Amounts in Pool
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-black/20 rounded">
                            <div className="text-xs text-gray-400 mb-1">{pairInfo.token0}</div>
                            <div className="text-white font-bold text-lg">
                              {formatTokenAmount(pairInfo.totalValueLockedToken0)}
                            </div>
                            {pairInfo.token0Name && (
                              <div className="text-gray-500 text-xs mt-1">{pairInfo.token0Name}</div>
                            )}
                          </div>
                          <div className="p-2 bg-black/20 rounded">
                            <div className="text-xs text-gray-400 mb-1">{pairInfo.token1}</div>
                            <div className="text-white font-bold text-lg">
                              {formatTokenAmount(pairInfo.totalValueLockedToken1)}
                            </div>
                            {pairInfo.token1Name && (
                              <div className="text-gray-500 text-xs mt-1">{pairInfo.token1Name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="md:col-span-2 p-2 bg-white/5 rounded">
                  <div className="text-gray-400 text-xs mb-1">Liquidity (Raw Units)</div>
                  <div className="text-white font-mono text-sm">{BigInt(contractInfo.liquidity).toLocaleString()}</div>
                  <div className="text-gray-500 text-xs mt-1">sqrt(amount0 × amount1)</div>
                </div>
                <div className="md:col-span-2 p-2 bg-white/5 rounded">
                  <div className="text-gray-400 text-xs mb-1">Token0 Address</div>
                  <a 
                    href={`${explorerUrl}/address/${contractInfo.token0}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all inline-flex items-center gap-1"
                  >
                    {contractInfo.token0}
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="md:col-span-2 p-2 bg-white/5 rounded">
                  <div className="text-gray-400 text-xs mb-1">Token1 Address</div>
                  <a 
                    href={`${explorerUrl}/address/${contractInfo.token1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-xs break-all inline-flex items-center gap-1"
                  >
                    {contractInfo.token1}
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Control Panel */}
      <div className="p-6 border-b border-white/10 space-y-4">
        {/* Day Range Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Time Range
          </label>
          <div className="flex gap-2 flex-wrap">
            {([30, 60, 90, 120, 365] as DayRange[]).map((days) => (
              <button
                key={days}
                onClick={() => setDayRange(days)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  dayRange === days
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Volume USD
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Fees USD
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Tx Count
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Volume {pairInfo?.token0 || 'Token0'}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Volume {pairInfo?.token1 || 'Token1'}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                TVL USD
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((day, index) => (
              <tr 
                key={day.date}
                className="hover:bg-white/5 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                  {day.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right font-semibold">
                  {formatNumber(day.volumeUSD)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 text-right font-semibold">
                  {formatNumber(day.feesUSD)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300 text-right font-medium">
                  {parseInt(day.txCount || '0').toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                  {formatTokenAmount(day.volumeToken0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                  {formatTokenAmount(day.volumeToken1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                  {formatNumber(day.tvlUSD)}
                </td>
              </tr>
            ))}
          </tbody>
          {summaries && (
            <tfoot className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-t-2 border-pink-500/50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                  SUMMARY
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-bold">
                  {formatNumber(summaries.totalVolumeUSD)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 text-right font-bold">
                  {formatNumber(summaries.totalFees)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300 text-right font-bold">
                  {summaries.totalTxCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-bold">
                  {formatTokenAmount(summaries.totalVolumeToken0.toString())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-bold">
                  {formatTokenAmount(summaries.totalVolumeToken1.toString())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-bold">
                  {formatNumber(summaries.avgTVL)} <span className="text-xs text-gray-400">(avg)</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      <div className="bg-white/5 px-6 py-4 text-sm text-gray-400 text-center">
        Showing {data.length} days of trading data
      </div>

      {/* USD Price Chart - Shows the non-stablecoin/non-WETH token */}
      <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-2">{displayToken.symbol} Price Chart (USD)</h3>
        <p className="text-gray-400 text-sm mb-6">Historical price of {displayToken.symbol} in US Dollars (calculated from pool volume)</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={[...data].reverse().map(day => ({
            ...day,
            // Calculate USD price based on which token we're displaying
            calculatedPrice: displayToken.isToken0
              ? (parseFloat(day.volumeUSD) > 0 && parseFloat(day.volumeToken0) > 0 
                  ? parseFloat(day.volumeUSD) / parseFloat(day.volumeToken0)
                  : 0)
              : (parseFloat(day.volumeUSD) > 0 && parseFloat(day.volumeToken1) > 0 
                  ? parseFloat(day.volumeUSD) / parseFloat(day.volumeToken1)
                  : 0)
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              domain={['auto', 'auto']}
              label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
            />
            <Line 
              type="monotone" 
              dataKey="calculatedPrice"
              stroke="#EC4899" 
              strokeWidth={3}
              dot={false}
              name={`${displayToken.symbol} Price (USD)`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

