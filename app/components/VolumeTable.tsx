'use client'

import { useEffect, useState } from 'react'
import { fetchPairDayData } from '../utils/uniswap'

interface DayData {
  date: string
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  tvlUSD: string
}

interface VolumeTableProps {
  pairAddress: string
}

export function VolumeTable({ pairAddress }: VolumeTableProps) {
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pairInfo, setPairInfo] = useState<{ token0: string; token1: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await fetchPairDayData(pairAddress.toLowerCase())
        setData(result.dayData)
        setPairInfo(result.pairInfo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    if (pairAddress) {
      fetchData()
    }
  }, [pairAddress])

  const formatNumber = (value: string) => {
    const num = parseFloat(value)
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
          <p className="text-gray-300 text-sm font-mono">{pairAddress}</p>
        </div>
      )}
      
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
        </table>
      </div>
      
      <div className="bg-white/5 px-6 py-4 text-sm text-gray-400 text-center">
        Showing {data.length} days of trading data
      </div>
    </div>
  )
}

