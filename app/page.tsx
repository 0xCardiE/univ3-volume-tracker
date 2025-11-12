'use client'

import { useState } from 'react'
import { VolumeTable } from './components/VolumeTable'

export default function Home() {
  const [pairAddress, setPairAddress] = useState('0x5696c2c2fcb7e304a5b9faaec9cd37d369c9d067')
  const [searchAddress, setSearchAddress] = useState('0x5696c2c2fcb7e304a5b9faaec9cd37d369c9d067')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchAddress(pairAddress)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Uniswap V3 Volume Tracker
          </h1>
          <p className="text-gray-300 text-lg">
            Track daily trading volumes for any Uniswap V3 pair
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="pairAddress" className="block text-sm font-medium text-gray-200 mb-2">
                Pair Address
              </label>
              <input
                type="text"
                id="pairAddress"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-gray-300/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter Uniswap V3 pair address"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 shadow-lg"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <VolumeTable pairAddress={searchAddress} />
      </div>
    </main>
  )
}

