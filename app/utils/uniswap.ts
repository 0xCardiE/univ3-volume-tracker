import { GraphQLClient, gql } from 'graphql-request'

const PAIR_DAY_DATA_QUERY = gql`
  query GetPairDayData($pairAddress: String!, $first: Int!) {
    pool(id: $pairAddress) {
      id
      token0 {
        symbol
        name
      }
      token1 {
        symbol
        name
      }
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
    }
  }
`

interface PoolDayData {
  date: number
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  tvlUSD: string
}

interface PoolData {
  pool: {
    id: string
    token0: {
      symbol: string
      name: string
    }
    token1: {
      symbol: string
      name: string
    }
  } | null
  poolDayDatas: PoolDayData[]
}

export async function fetchPairDayData(pairAddress: string, days: number = 30, subgraphUrl: string) {
  try {
    const client = new GraphQLClient(subgraphUrl)
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
      volumeUSD: day.volumeUSD,
      volumeToken0: day.volumeToken0,
      volumeToken1: day.volumeToken1,
      tvlUSD: day.tvlUSD,
    }))

    return {
      dayData,
      pairInfo: {
        token0: data.pool.token0.symbol,
        token1: data.pool.token1.symbol,
      },
    }
  } catch (error) {
    console.error('Error fetching pool data:', error)
    throw new Error('Failed to fetch pool data. Please verify the pool address is correct.')
  }
}

