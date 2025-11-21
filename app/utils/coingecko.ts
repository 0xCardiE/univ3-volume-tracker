export interface TrendingPool {
  id: string
  address: string
  name: string
  network: string
  dex: string
  baseToken: {
    address: string
    name: string
    symbol: string
    imageUrl: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
    imageUrl: string
  }
  baseTokenPriceUsd: string
  quoteTokenPriceUsd: string
  volumeUsd24h: string
  priceChangePercentage24h: string
  reserveInUsd: string
  transactions24h: {
    buys: number
    sells: number
    buyers: number
    sellers: number
  }
}

export async function fetchTrendingPools(apiKey: string): Promise<TrendingPool[]> {
  try {
    const response = await fetch('https://pro-api.coingecko.com/api/v3/onchain/networks/trending_pools', {
      headers: {
        'x-cg-pro-api-key': apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const json = await response.json()
    
    // Create a map of included tokens for easy lookup
    const tokensMap = new Map()
    if (json.included) {
      json.included.forEach((item: any) => {
        if (item.type === 'token') {
          tokensMap.set(item.id, item.attributes)
        }
      })
    }

    const pools: TrendingPool[] = json.data.map((pool: any) => {
      const attrs = pool.attributes
      const baseTokenId = pool.relationships?.base_token?.data?.id
      const quoteTokenId = pool.relationships?.quote_token?.data?.id
      const dexId = pool.relationships?.dex?.data?.id

      const baseTokenData = tokensMap.get(baseTokenId) || {}
      const quoteTokenData = tokensMap.get(quoteTokenId) || {}

      // Extract network from pool id (e.g., "eth_0x..." -> "eth")
      const network = pool.id.split('_')[0]

      return {
        id: pool.id,
        address: attrs.address,
        name: attrs.name,
        network: network,
        dex: dexId || 'unknown',
        baseToken: {
          address: baseTokenData.address || '',
          name: baseTokenData.name || 'Unknown',
          symbol: baseTokenData.symbol || '???',
          imageUrl: baseTokenData.image_url || '',
        },
        quoteToken: {
          address: quoteTokenData.address || '',
          name: quoteTokenData.name || 'Unknown',
          symbol: quoteTokenData.symbol || '???',
          imageUrl: quoteTokenData.image_url || '',
        },
        baseTokenPriceUsd: attrs.base_token_price_usd,
        quoteTokenPriceUsd: attrs.quote_token_price_usd,
        volumeUsd24h: attrs.volume_usd?.h24 || '0',
        priceChangePercentage24h: attrs.price_change_percentage?.h24 || '0',
        reserveInUsd: attrs.reserve_in_usd || '0',
        transactions24h: attrs.transactions?.h24 || { buys: 0, sells: 0, buyers: 0, sellers: 0 },
      }
    })

    return pools
  } catch (error) {
    console.error('Failed to fetch trending pools:', error)
    throw error
  }
}

