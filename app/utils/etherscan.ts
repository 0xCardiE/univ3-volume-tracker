// Etherscan API utilities for fetching contract information

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || ''
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api' // V2 API endpoint
const ETHEREUM_CHAIN_ID = '1' // Ethereum mainnet

export interface PoolContractInfo {
  fee: string
  feePercentage: number
  token0: string
  token1: string
  liquidity: string
  tickSpacing: string
  sqrtPriceX96: string
}

// Function selectors for Uniswap V3 Pool contract
const FUNCTION_SELECTORS: Record<string, string> = {
  fee: '0xddca3f43', // fee()
  token0: '0x0dfe1681', // token0()
  token1: '0xd21220a7', // token1()
  liquidity: '0x1a686502', // liquidity()
  tickSpacing: '0xd0c93a7c', // tickSpacing()
  slot0: '0x3850c7bd', // slot0()
}

// Helper function to add delay between API calls
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callReadFunction(contractAddress: string, functionName: string): Promise<string> {
  const selector = FUNCTION_SELECTORS[functionName]
  if (!selector) {
    throw new Error(`Unknown function: ${functionName}`)
  }

  const url = new URL(ETHERSCAN_API_BASE)
  url.searchParams.append('chainid', ETHEREUM_CHAIN_ID) // Required for V2 API
  url.searchParams.append('module', 'proxy')
  url.searchParams.append('action', 'eth_call')
  url.searchParams.append('to', contractAddress)
  url.searchParams.append('data', selector)
  url.searchParams.append('tag', 'latest')
  url.searchParams.append('apikey', ETHERSCAN_API_KEY)

  console.log(`Calling Etherscan V2 API for ${functionName}:`, url.toString())

  const response = await fetch(url.toString())
  const data = await response.json()

  console.log(`Response for ${functionName}:`, data)

  // V2 API returns JSON-RPC format
  if (data.jsonrpc === '2.0' && data.result && data.result !== '0x') {
    return data.result
  } 
  // Fallback to old format check
  else if (data.status === '1' && data.result && data.result !== '0x') {
    return data.result
  } 
  // Check for rate limit error
  else if (data.status === '0' && data.message && data.message.includes('rate limit')) {
    throw new Error('Rate limit reached. Please wait a moment and try again.')
  }
  else {
    console.error(`Failed to call ${functionName}:`, data)
    throw new Error(`Failed to call ${functionName}: ${data.message || data.result || 'Unknown error'}`)
  }
}

function parseUint24(hexString: string): number {
  if (!hexString || hexString === '0x' || hexString === '0x0') return 0
  // Remove 0x prefix and pad to 64 characters, then get last 6 characters (24 bits = 3 bytes = 6 hex chars)
  const cleaned = hexString.replace('0x', '').padStart(64, '0')
  const uint24Hex = cleaned.slice(-6)
  return parseInt(uint24Hex, 16)
}

function parseAddress(hexString: string): string {
  if (!hexString || hexString === '0x' || hexString === '0x0') return '0x0000000000000000000000000000000000000000'
  // Remove 0x prefix, pad to 64 characters, get last 40 characters (20 bytes = 40 hex chars)
  const cleaned = hexString.replace('0x', '').padStart(64, '0')
  const addressHex = cleaned.slice(-40)
  return '0x' + addressHex
}

function parseUint128(hexString: string): string {
  if (!hexString || hexString === '0x' || hexString === '0x0') return '0'
  // Remove 0x prefix and pad to 64 characters, then get last 32 characters (128 bits = 16 bytes = 32 hex chars)
  const cleaned = hexString.replace('0x', '').padStart(64, '0')
  const uint128Hex = cleaned.slice(-32)
  return BigInt('0x' + uint128Hex).toString()
}

function parseInt24(hexString: string): number {
  if (!hexString || hexString === '0x' || hexString === '0x0') return 0
  // Parse signed 24-bit integer (tick spacing)
  const cleaned = hexString.replace('0x', '').padStart(64, '0')
  const int24Hex = cleaned.slice(-6)
  let value = parseInt(int24Hex, 16)
  // Handle negative numbers (two's complement)
  if (value >= 0x800000) {
    value = value - 0x1000000
  }
  return value
}

export async function fetchPoolContractInfo(poolAddress: string): Promise<PoolContractInfo> {
  try {
    // Make sequential calls with delays to avoid rate limits (5 calls per second limit)
    console.log('Fetching pool contract info...')
    
    const feeResult = await callReadFunction(poolAddress, 'fee').catch(e => ({ status: 'rejected', reason: e }))
    await delay(250) // 250ms delay = 4 calls per second (under 5/sec limit)
    
    const token0Result = await callReadFunction(poolAddress, 'token0').catch(e => ({ status: 'rejected', reason: e }))
    await delay(250)
    
    const token1Result = await callReadFunction(poolAddress, 'token1').catch(e => ({ status: 'rejected', reason: e }))
    await delay(250)
    
    const liquidityResult = await callReadFunction(poolAddress, 'liquidity').catch(e => ({ status: 'rejected', reason: e }))
    await delay(250)
    
    const tickSpacingResult = await callReadFunction(poolAddress, 'tickSpacing').catch(e => ({ status: 'rejected', reason: e }))
    await delay(250)
    
    const slot0Result = await callReadFunction(poolAddress, 'slot0').catch(e => ({ status: 'rejected', reason: e }))
    
    // Convert results to PromiseSettledResult format for compatibility
    const results = [feeResult, token0Result, token1Result, liquidityResult, tickSpacingResult, slot0Result].map(r => 
      typeof r === 'string' ? { status: 'fulfilled' as const, value: r } : r as PromiseRejectedResult
    )

    // Parse fee
    const feeHex = results[0].status === 'fulfilled' ? results[0].value : '0x0'
    const feeValue = parseUint24(feeHex)
    const feePercentage = feeValue / 10000 // Convert from basis points to percentage

    // Parse token addresses
    const token0 = results[1].status === 'fulfilled' ? parseAddress(results[1].value) : '0x0'
    const token1 = results[2].status === 'fulfilled' ? parseAddress(results[2].value) : '0x0'

    // Parse liquidity
    const liquidityHex = results[3].status === 'fulfilled' ? results[3].value : '0x0'
    const liquidity = parseUint128(liquidityHex)

    // Parse tick spacing
    const tickSpacingHex = results[4].status === 'fulfilled' ? results[4].value : '0x0'
    const tickSpacing = parseInt24(tickSpacingHex)

    // Parse slot0 (just get sqrtPriceX96, which is the first 160 bits)
    const slot0Hex = results[5].status === 'fulfilled' ? results[5].value : '0x0'
    const sqrtPriceHex = '0x' + slot0Hex.replace('0x', '').slice(0, 40) // First 160 bits
    const sqrtPriceX96 = BigInt(sqrtPriceHex || '0x0').toString()

    return {
      fee: feeValue.toString(),
      feePercentage,
      token0,
      token1,
      liquidity,
      tickSpacing: tickSpacing.toString(),
      sqrtPriceX96,
    }
  } catch (error) {
    console.error('Error fetching pool contract info:', error)
    throw new Error('Failed to fetch contract information from Etherscan. Please check your API key and pool address.')
  }
}

