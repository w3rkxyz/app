'use client'

import React from 'react'

interface RateSelectorProps {
  rateType: 'Hourly' | 'Price'
  rate: string
  onRateTypeChange: (type: 'Hourly' | 'Price') => void
  onRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  label?: string,
  startContent?: string,
  required?: boolean,
  bgcolor?: string,
  inputClasses?: string
}

const RateSelector: React.FC<RateSelectorProps> = ({
  rateType,
  rate,
  onRateTypeChange,
  onRateChange,
  label="What&apos;s Your Rate?",
  startContent="Hourly",
  required = false,
  bgcolor,
  inputClasses
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-900">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex ">
        <div className="flex rounded-l-lg border border-gray-300">
          <button
            type="button"
            onClick={() => onRateTypeChange('Hourly')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all sm:px-6 sm:text-base ${
              rateType === 'Hourly'
                ? 'bg-[#FAFAFA] text-[#777A82]'
                : `text-gray-700 bg-[${bgcolor}] hover:bg-gray-50`
            }`}
          >
            {startContent}
          </button>
        </div>
        <input
          type="number"
          name="rate"
          value={rate}
          onChange={onRateChange}
          placeholder="Amount"
          className={`flex-1 rounded-r-lg border border-gray-300 border-l-0 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none sm:text-base ${inputClasses}`}
        />
      </div>
    </div>
  )
}

export default RateSelector

