import { GraphQLClient, gql } from 'graphql-request'

const PAIR_DAY_DATA_QUERY = gql`
  query GetPairDayData($pairAddress: String!, $first: Int!) {
    pool(id: $pairAddress) {
      id
      token0 {
        symbol
        name
        decimals
      }
      token1 {
        symbol
        name
        decimals
      }
      totalValueLockedToken0
      totalValueLockedToken1
      totalValueLockedUSD
    }
    poolDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { pool: $pairAddress }
    ) {
      date
      volumeUSD
      volumeToken0
      volumeToken1
      tvlUSD
      feesUSD
      txCount
      open
      high
      low
      close
    }
  }
`

interface PoolDayData {
  date: number
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  tvlUSD: string
  feesUSD?: string
  txCount?: string
  open?: string
  high?: string
  low?: string
  close?: string
}

interface PoolData {
  pool: {
    id: string
    token0: {
      symbol: string
      name: string
      decimals: string
    }
    token1: {
      symbol: string
      name: string
      decimals: string
    }
    totalValueLockedToken0: string
    totalValueLockedToken1: string
    totalValueLockedUSD: string
  } | null
  poolDayDatas: PoolDayData[]
}

export async function fetchPairDayData(pairAddress: string, days: number = 30, subgraphUrl: string) {
  try {
    // Extract API key from URL if present (format: /api/{key}/subgraphs/id/{id})
    const apiKeyMatch = subgraphUrl.match(/\/api\/([^\/]+)\/subgraphs/)
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : ''
    
    // Create client with authorization header
    const client = new GraphQLClient(subgraphUrl, {
      headers: apiKey ? {
        'Authorization': `Bearer ${apiKey}`
      } : {}
    })
    
    const data = await client.request<PoolData>(PAIR_DAY_DATA_QUERY, {
      pairAddress: pairAddress.toLowerCase(),
      first: days,
    })

    if (!data.pool) {
      throw new Error('Pool not found. Please check the address and try again.')
    }

    if (!data.poolDayDatas || data.poolDayDatas.length === 0) {
      throw new Error('No trading data available for this pool.')
    }

    const dayData = data.poolDayDatas.map((day) => ({
      date: new Date(day.date * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      dateTimestamp: day.date,
      volumeUSD: day.volumeUSD,
      volumeToken0: day.volumeToken0,
      volumeToken1: day.volumeToken1,
      tvlUSD: day.tvlUSD,
      feesUSD: day.feesUSD || '0',
      txCount: day.txCount || '0',
      open: day.open || '0',
      high: day.high || '0',
      low: day.low || '0',
      close: day.close || '0',
    }))

    return {
      dayData,
      pairInfo: {
        token0: data.pool.token0.symbol,
        token1: data.pool.token1.symbol,
        token0Name: data.pool.token0.name,
        token1Name: data.pool.token1.name,
        totalValueLockedToken0: data.pool.totalValueLockedToken0,
        totalValueLockedToken1: data.pool.totalValueLockedToken1,
        totalValueLockedUSD: data.pool.totalValueLockedUSD,
      },
    }
  } catch (error) {
    console.error('Error fetching pool data:', error)
    throw new Error('Failed to fetch pool data. Please verify the pool address is correct.')
  }
}

