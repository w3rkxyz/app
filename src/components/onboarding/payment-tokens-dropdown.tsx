'use client'

import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, Plus } from 'lucide-react'
import { tokenOptions } from '@/utils/constants'

const tokenOptionsWithIcons = tokenOptions.map(token => ({
  name: token.name,
  symbol: token.symbol,
  icon: token.icon,
  color: token.color,
  iconPath: `/icons/${token.symbol.toLowerCase()}.svg`,
}))

interface PaymentTokensDropdownProps {
  tokens: string[]
  onUpdateToken: (index: number, tokenName: string, tokenSymbol: string) => void
  onAddToken: () => void
  onRemoveToken: (index: number) => void,
  button?: boolean
}

const PaymentTokensDropdown: React.FC<PaymentTokensDropdownProps> = ({
  tokens,
  onUpdateToken,
  onAddToken,
  onRemoveToken,
  button=true
}) => {
  const [showTokenDropdown, setShowTokenDropdown] = useState<number | null>(null)
  const [tokenSearch, setTokenSearch] = useState('')

  const filteredTokens = tokenOptionsWithIcons.filter(
    token =>
      token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-token-dropdown]')) {
        setShowTokenDropdown(null)
        setTokenSearch('')
      }
    }

    if (showTokenDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showTokenDropdown])
  

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-[#212121]">
        Payment Token(s)<span className="text-red-500">*</span>
      </label>
      <div className="space-y-2 mb-2">
        {tokens.map((token, index) => {
          const tokenInfo = tokenOptionsWithIcons.find(
            t => token.includes(t.name) || token.includes(t.symbol)
          ) || tokenOptionsWithIcons[0]
          return (
            <div key={index} className="relative" data-token-dropdown>
              <button
                type="button"
                onClick={() => setShowTokenDropdown(showTokenDropdown === index ? null : index)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-[20px] w-[20px] items-center justify-center rounded-full ${tokenInfo.color} p-1`}>
                    <img 
                      src={tokenInfo.iconPath} 
                      alt={tokenInfo.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium">{tokenInfo.name}</span>
                  <span className="text-sm text-gray-500">({tokenInfo.symbol})</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${showTokenDropdown === index ? 'rotate-180' : ''}`}
                />
              </button>
              {showTokenDropdown === index && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl" data-token-dropdown>
                  <div className="">
                    <div className="relative">
                      <Search 
                        size={16} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search Tokens..."
                        value={tokenSearch}
                        onChange={e => setTokenSearch(e.target.value)}
                        className="w-full rounded-md  border-gray-200 border-b  py-3 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-0"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {filteredTokens.map((tokenOption) => (
                      <button
                        key={`${tokenOption.name}-${index}`}
                        type="button"
                        onClick={() => {
                          onUpdateToken(index, tokenOption.name, tokenOption.symbol)
                          setShowTokenDropdown(null)
                          setTokenSearch('')
                        }}
                        className="flex w-full items-center gap-1 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className={`flex h-[24px] w-[24px] items-center justify-center rounded-full ${tokenOption.color} p-1 flex-shrink-0`}>
                          <img 
                            src={tokenOption.iconPath} 
                            alt={tokenOption.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-baseline gap-1 min-w-0">
                          <span className="font-medium text-sm text-gray-900">{tokenOption.name}</span>
                          <span className="text-sm text-gray-500">({tokenOption.symbol})</span>
                        </div>
                      </button>
                    ))}
                    {filteredTokens.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No tokens found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {button && <button
          type="button"
          onClick={onAddToken}
          className="flex mt-2  items-center justify-center gap-1 rounded-full border border-[#212121]  bg-white px-4 py-2 text-sm font-medium text-[#212121] transition-colors"
        >
          <Plus size={15} />
          <span>Add another</span>
        </button>}
      </div>
    </div>
  )
}

export default PaymentTokensDropdown

// Demo wrapper component
// export default function Demo() {
//   const [tokens, setTokens] = useState(['Ethereum (ETH)'])

//   const handleUpdateToken = (index: number, tokenName: string, tokenSymbol: string) => {
//     const newTokens = [...tokens]
//     newTokens[index] = `${tokenName} (${tokenSymbol})`
//     setTokens(newTokens)
//   }

//   const handleAddToken = () => {
//     setTokens([...tokens, 'Ethereum (ETH)'])
//   }

//   const handleRemoveToken = (index: number) => {
//     setTokens(tokens.filter((_, i) => i !== index))
//   }

//   return (
//     <div className="min-h-">
//       <PaymentTokensDropdown
//         tokens={tokens}
//         onUpdateToken={handleUpdateToken}
//         onAddToken={handleAddToken}
//         onRemoveToken={handleRemoveToken}
//       />
//     </div>
//   )
// }