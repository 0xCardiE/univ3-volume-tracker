import { GraphQLClient, gql } from 'graphql-request'

// Uniswap V3/V4 Query (uses 'pool' and 'poolDayDatas')
const V3_PAIR_DAY_DATA_QUERY = gql`
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
      token0Price
      token1Price
    }
  }
`

// Uniswap V2 Query (uses 'pair' and 'pairDayDatas')
const V2_PAIR_DAY_DATA_QUERY = gql`
  query GetPairDayData($pairAddress: String!, $first: Int!) {
    pair(id: $pairAddress) {
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
      reserve0
      reserve1
      reserveUSD
    }
    pairDayDatas(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { pairAddress: $pairAddress }
    ) {
      date
      dailyVolumeUSD
      dailyVolumeToken0
      dailyVolumeToken1
      reserveUSD
      dailyTxns
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
  token0Price?: string
  token1Price?: string
}

interface V3PoolData {
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

interface V2PairData {
  pair: {
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
    reserve0: string
    reserve1: string
    reserveUSD: string
  } | null
  pairDayDatas: {
    date: number
    dailyVolumeUSD: string
    dailyVolumeToken0: string
    dailyVolumeToken1: string
    reserveUSD: string
    dailyTxns: string
  }[]
}

export async function fetchPairDayData(
  pairAddress: string, 
  days: number = 30, 
  subgraphUrl: string,
  dexVersion?: string
) {
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
    
    // Determine if this is V2, V3, or V4
    const isV2 = dexVersion === 'v2'
    console.log(`🔍 Using ${dexVersion || 'V3'} subgraph for address: ${pairAddress}`)
    console.log(`📍 Subgraph URL: ${subgraphUrl}`)
    console.log(`🔑 API Key found: ${apiKey ? 'Yes' : 'No'}`)
    
    if (isV2) {
      // Use V2 query
      console.log('📊 Executing V2 query...')
      console.log('Query:', V2_PAIR_DAY_DATA_QUERY)
      console.log('Variables:', { pairAddress: pairAddress.toLowerCase(), first: days })
      
      const data = await client.request<V2PairData>(V2_PAIR_DAY_DATA_QUERY, {
        pairAddress: pairAddress.toLowerCase(),
        first: days,
      })
      
      console.log('✅ V2 Query response:', JSON.stringify(data, null, 2))

      if (!data.pair) {
        console.error('❌ V2 Pair not found in response')
        console.error('Response data:', data)
        throw new Error('Pair not found. Please check the address and try again.')
      }

      if (!data.pairDayDatas || data.pairDayDatas.length === 0) {
        throw new Error('No trading data available for this pair.')
      }

      // Map V2 data to common format
      const dayData = data.pairDayDatas.map((day) => ({
        date: new Date(day.date * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        dateTimestamp: day.date,
        volumeUSD: day.dailyVolumeUSD,
        volumeToken0: day.dailyVolumeToken0,
        volumeToken1: day.dailyVolumeToken1,
        tvlUSD: day.reserveUSD,
        feesUSD: '0', // V2 doesn't track fees separately
        txCount: day.dailyTxns || '0',
        open: '0',
        high: '0',
        low: '0',
        close: '0',
        token0Price: '0',
        token1Price: '0',
      }))

      return {
        dayData,
        pairInfo: {
          token0: data.pair.token0.symbol,
          token1: data.pair.token1.symbol,
          token0Name: data.pair.token0.name,
          token1Name: data.pair.token1.name,
          totalValueLockedToken0: data.pair.reserve0,
          totalValueLockedToken1: data.pair.reserve1,
          totalValueLockedUSD: data.pair.reserveUSD,
        },
      }
    } else {
      // Use V3 query
      console.log('📊 Executing V3/V4 query...')
      console.log('Query:', V3_PAIR_DAY_DATA_QUERY)
      console.log('Variables:', { pairAddress: pairAddress.toLowerCase(), first: days })
      
      const data = await client.request<V3PoolData>(V3_PAIR_DAY_DATA_QUERY, {
        pairAddress: pairAddress.toLowerCase(),
        first: days,
      })
      
      console.log('✅ V3 Query response:', JSON.stringify(data, null, 2))

      if (!data.pool) {
        console.error('❌ V3 Pool not found in response')
        console.error('Response data:', data)
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
        token0Price: day.token0Price || '0',
        token1Price: day.token1Price || '0',
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
    }
  } catch (error: any) {
    console.error('❌ ERROR fetching pool data:')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Full error:', error)
    
    // Log GraphQL specific errors
    if (error?.response) {
      console.error('GraphQL Response:', JSON.stringify(error.response, null, 2))
    }
    if (error?.request) {
      console.error('GraphQL Request:', error.request)
    }
    
    // Re-throw with more context
    const errorMsg = error?.message || 'Unknown error'
    throw new Error(`Failed to fetch pool data: ${errorMsg}. Please verify the pool address is correct and the subgraph is accessible.`)
  }
}

