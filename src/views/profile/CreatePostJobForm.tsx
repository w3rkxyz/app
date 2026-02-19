"use client";

import React from "react";
import FormInput from "@/components/onboarding/form-input";
import FormTextarea from "@/components/onboarding/form-textarea";
import BudgetSelector from "@/components/onboarding/budget-selector";
import PaymentTokensDropdown from "@/components/onboarding/payment-tokens-dropdown";
import CategorySelector from "@/components/onboarding/category-selector";
import NavigationButtons from "@/components/onboarding/navigation-buttons";
import type { Step3JobFormProps } from "@/types/onboarding";

const CreatePostJobForm: React.FC<
  Step3JobFormProps & {
    title?: string;
    subtitle?: string;
    stepText?: string;
    /** When true, navigation buttons are not rendered (modal provides footer) */
    hideNavigation?: boolean;
  }
> = ({
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
  title = "Create Your First Job",
  subtitle = "Post your first job and connect with top freelancers.",
  stepText = "Step 3 of 3",
  hideNavigation = false,
}) => {
  const isValid = jobData.description && jobData.budget && jobData.categories.length > 0;

  return (
    <div className="flex w-full max-w-full flex-col px-2 xs:px-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[584px]">
        {stepText && (
          <p className="mb-1 text-xs text-[#83899F] xs:mb-2 xs:text-[13px]">{stepText}</p>
        )}

        {/* <div className="mb-4 xs:mb-6 sm:mb-8">
          <h1 className="mb-1 text-[20px] font-medium text-primary-black xs:text-[24px] sm:text-[28px]">
            {title}
          </h1>
          <p className="text-sm text-[#83899F] xs:text-base">{subtitle}</p>
        </div> */}

        <div className="space-y-3 xs:space-y-4">
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

        {!hideNavigation && (
          <NavigationButtons
            onBack={onBack}
            onContinue={onPublish}
            continueLabel="Publish Job"
            continueDisabled={!isValid}
            showSkip={true}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePostJobForm;
