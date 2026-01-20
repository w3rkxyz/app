'use client'

import React from 'react'
import FormInput from './form-input'
import FormTextarea from './form-textarea'
import BudgetSelector from './budget-selector'
import PaymentTokensDropdown from './payment-tokens-dropdown'
import CategorySelector from './category-selector'
import NavigationButtons from './navigation-buttons'
import type { Step3JobFormProps } from '@/types/onboarding'

const Step3JobForm: React.FC<Step3JobFormProps> = ({
  jobData,
  onInputChange,
  onCurrencyChange,
  onUpdateToken,
  onAddToken,
  onRemoveToken,
  onToggleCategory,
  onRemoveCategory,
  onBack,
  onPublish,
}) => {
  const isValid = jobData.description && jobData.budget && jobData.categories.length > 0

  return (
    <div className="flex min-h-screen flex-col w-full xs:px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-[584px]">
        <p className="mb-2 text-[13px] text-[#83899F]">Step 3 of 3</p>

        <div className="mb-6 sm:mb-8">
          <h1 className="mb-1 xs:text-[24px] text-[28px] font-medium text-primary-black">
            Create Your First Job
          </h1>
          <p className="text-[#83899F] text-base">
            Post your first job and connect with top freelancers.
          </p>
        </div>

        <div className="space-y-4">
          <FormInput
            label="What's The Job Title?"
            name="jobTitle"
            value={jobData.jobTitle}
            onChange={onInputChange}
            placeholder="e.g. Solidity Smart Contract Audit"
          />

          <FormTextarea
            label="Describe Your job"
            name="description"
            value={jobData.description}
            onChange={onInputChange}
            placeholder="Describe the work you need"
            maxLength={800}
            rows={6}
            required
          />

          <BudgetSelector
            currency={jobData.currency}
            budget={jobData.budget}
            onCurrencyChange={onCurrencyChange}
            onBudgetChange={onInputChange}
          />

          <PaymentTokensDropdown
            tokens={jobData.paymentTokens}
            onUpdateToken={onUpdateToken}
            onAddToken={onAddToken}
            onRemoveToken={onRemoveToken}
          />

          <CategorySelector
            selectedCategories={jobData.categories}
            onToggleCategory={onToggleCategory}
            onRemoveCategory={onRemoveCategory}
            label="Select Job Category"
          />
        </div>

        <NavigationButtons
          onBack={onBack}
          onContinue={onPublish}
          continueLabel="Publish Job"
          continueDisabled={!isValid}
          showSkip={true}
        />
      </div>
    </div>
  )
}

export default Step3JobForm

