/**
 * CoinGecko API Configuration Constants
 * Using the Megafilter endpoint: https://docs.coingecko.com/reference/pools-megafilter
 * 
 * API Documentation: https://docs.coingecko.com/reference/pools-megafilter
 * Base URL: https://pro-api.coingecko.com/api/v3/onchain/pools/megafilter
 */

// Networks to filter (Ethereum, Base, Gnosis)
const COINGECKO_NETWORKS = ['eth', 'base', 'gno']

// Quality checks to filter pools
// Available values: 'no_honeypot', 'good_gt_score', 'on_coingecko', 'has_social'
// - no_honeypot: Exclude known honeypot tokens
// - good_gt_score: Only include pools with good GeckoTerminal scores
// - on_coingecko: Only include tokens listed on CoinGecko
// - has_social: Only include tokens with social media presence
const COINGECKO_CHECKS = ['no_honeypot']

// Data to include in the response
// Available values: 'base_token', 'quote_token', 'dex', 'network'
const COINGECKO_INCLUDE = ['base_token', 'quote_token', 'dex', 'network']

// Sort options
// Available values: 'm5_trending', 'h1_trending', 'h6_trending', 'h24_trending',
//                  'h24_tx_count_desc', 'h24_volume_usd_desc',
//                  'h24_price_change_percentage_desc', 'reserve_in_usd_desc', etc.
const COINGECKO_SORT = 'h24_volume_usd_desc'

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
    if (!apiKey) {
      throw new Error('CoinGecko API key is required')
    }

    // Build query parameters
    const params = new URLSearchParams()
    params.append('include', COINGECKO_INCLUDE.join(','))
    
    // Try the trending pools endpoint first as fallback
    // The megafilter endpoint might require a higher tier API plan
    const useMegafilter = false // Set to true if you have access to megafilter endpoint
    
    let url: string
    
    if (useMegafilter) {
      // Megafilter endpoint (may require Pro+ plan)
      // https://docs.coingecko.com/reference/pools-megafilter
      params.append('page', '1')
      params.append('networks', COINGECKO_NETWORKS.join(','))
      params.append('checks', COINGECKO_CHECKS.join(','))
      params.append('sort', COINGECKO_SORT)
      url = `https://pro-api.coingecko.com/api/v3/onchain/pools/megafilter?${params.toString()}`
    } else {
      // Trending pools endpoint (available on standard Pro plans)
      url = `https://pro-api.coingecko.com/api/v3/onchain/networks/trending_pools?${params.toString()}`
    }
    
    console.log('Fetching pools from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-cg-pro-api-key': apiKey,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('CoinGecko API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: url
      })
      throw new Error(`CoinGecko API error: ${response.status} - ${response.statusText}`)
    }

    const json = await response.json()
    
    // Create maps for all included data for easy lookup
    const tokensMap = new Map()
    const dexesMap = new Map()
    const networksMap = new Map()
    
    if (json.included) {
      json.included.forEach((item: any) => {
        if (item.type === 'token') {
          tokensMap.set(item.id, item.attributes)
        } else if (item.type === 'dex') {
          dexesMap.set(item.id, item.attributes)
        } else if (item.type === 'network') {
          networksMap.set(item.id, item.attributes)
        }
      })
    }

    const pools: TrendingPool[] = json.data.map((pool: any) => {
      const attrs = pool.attributes
      const baseTokenId = pool.relationships?.base_token?.data?.id
      const quoteTokenId = pool.relationships?.quote_token?.data?.id
      const dexId = pool.relationships?.dex?.data?.id
      const networkId = pool.relationships?.network?.data?.id

      const baseTokenData = tokensMap.get(baseTokenId) || {}
      const quoteTokenData = tokensMap.get(quoteTokenId) || {}
      const dexData = dexesMap.get(dexId) || {}
      const networkData = networksMap.get(networkId) || {}

      // Extract network from pool id (e.g., "eth_0x..." -> "eth")
      const network = pool.id.split('_')[0]

      return {
        id: pool.id,
        address: attrs.address,
        name: attrs.name,
        network: network,
        dex: dexData.name || dexId || 'unknown',
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

