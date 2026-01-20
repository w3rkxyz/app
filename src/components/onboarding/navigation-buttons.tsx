'use client'

import React from 'react'

interface NavigationButtonsProps {
  onBack: () => void
  onSkip?: () => void
  onContinue: () => void
  continueLabel: string
  continueDisabled: boolean
  showSkip?: boolean
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onSkip,
  onContinue,
  continueLabel,
  continueDisabled,
  showSkip = true,
}) => {
  return (
    <div className="mt-6 flex gap-4 sm:mt-8 flex-row justify-between">
      <button
        onClick={onBack}
        className="order-2 rounded-full border-2 border-[#212121] bg-white px-4 py-2 text-sm font-medium text-[#212121] transition-all hover:border-gray-400 hover:bg-gray-50 sm:order-1 sm:text-base"
      >
        Back
      </button>
      <div className=" order-2 flex  gap-3 sm:flex-row sm:items-center sm:gap-4">
        {showSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 "
          >
            Skip for now
          </button>
        )}
        <button
          onClick={onContinue}
          disabled={continueDisabled}
          className={`rounded-full px-4 py-2 text-sm font-medium text-white transition-all  sm:text-base ${
            continueDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#212121] hover:bg-gray-800 cursor-pointer'
          }`}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}

export default NavigationButtons

