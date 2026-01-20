'use client'

import React, { useState } from 'react'

interface BudgetSelectorProps {
  currency: string
  budget: string
  onCurrencyChange: (currency: string) => void
  onBudgetChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  currency,
  budget,
  onCurrencyChange,
  onBudgetChange,
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#212121]">
        What&apos;s Your Budget?<span className="text-red-500">*</span>
      </label>
      <div className="flex ">
        <div className="relative ">
          <button
            type="button"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex w-full items-center justify-between gap-2 rounded-l-lg border border-[#C3C7CE] bg-[#FAFAFA] px-4 py-3 text-sm text-[#777A82] hover:bg-gray-50 sm:w-auto"
          >
            {currency}
          </button>
        </div>
        <input
          type="number"
          name="budget"
          value={budget}
          onChange={onBudgetChange}
          placeholder="Amount"
          className="flex-1 rounded-r-lg border border-[#C3C7CE] border-l-0 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none "
        />
      </div>
    </div>
  )
}

export default BudgetSelector

