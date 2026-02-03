'use client'

import React from 'react'
import FormInput from './form-input'
import FormTextarea from './form-textarea'
import RateSelector from './rate-selector'
import PaymentTokensDropdown from './payment-tokens-dropdown'
import CategorySelector from './category-selector'
import NavigationButtons from './navigation-buttons'
import type { Step3ServiceFormProps } from '@/types/onboarding'

const Step3ServiceForm: React.FC<Step3ServiceFormProps & {
  title?: string;
  subtitle?: string;
  stepText?: string;
  /** When true, navigation buttons are not rendered (e.g. when modal provides footer) */
  hideNavigation?: boolean;
}> = ({
  serviceData,
  onInputChange,
  onRateTypeChange,
  onUpdateToken,
  onAddToken,
  onRemoveToken,
  onToggleCategory,
  onRemoveCategory,
  onBack,
  onAddService,
  title = "Create Your First Service",
  subtitle = "Showcase what you can do. Clients will discover your service when searching.",
  stepText = "Step 3 of 3",
  hideNavigation = false,
}) => {
    const isValid =
      serviceData.serviceTitle &&
      serviceData.description &&
      serviceData.rate &&
      serviceData.categories.length > 0

    return (
      <div className="flex min-h-screen flex-col w-full xs:px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto w-full max-w-[584px]">
          {stepText && <p className="mb-2 text-[13px] text-[#83899F]">{stepText}</p>}

          <div className="mb-6 sm:mb-8">
            <h1 className="mb-1 xs:text-[24px] text-[28px] font-medium text-primary-black">
              {title}
            </h1>
            <p className="text-[#83899F] text-base">
              {subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <FormInput
              label="What's The Service Title?"
              name="serviceTitle"
              value={serviceData.serviceTitle}
              onChange={onInputChange}
              placeholder="e.g. Web3 Product Designer"
              required
            />

            <FormTextarea
              label="Describe Your Service"
              name="description"
              value={serviceData.description}
              onChange={onInputChange}
              placeholder="Describe what you offer. Highlight your skills and results."
              maxLength={800}
              rows={6}
              required
            />

            <RateSelector
              rateType={serviceData.rateType}
              rate={serviceData.rate}
              onRateTypeChange={onRateTypeChange}
              onRateChange={onInputChange}
            />

            <PaymentTokensDropdown
              tokens={serviceData.paymentTokens}
              onUpdateToken={onUpdateToken}
              onAddToken={onAddToken}
              onRemoveToken={onRemoveToken}
            />

            <CategorySelector
              selectedCategories={serviceData.categories}
              onToggleCategory={onToggleCategory}
              onRemoveCategory={onRemoveCategory}
              label="Select Service Category"
            />
          </div>

          {!hideNavigation && (
            <NavigationButtons
              onBack={onBack}
              onContinue={onAddService}
              continueLabel="Add Service"
              continueDisabled={!isValid}
              showSkip={true}
            />
          )}
        </div>
      </div>
    )
  }

export default Step3ServiceForm

