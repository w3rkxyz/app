'use client'

import React, { useState, useCallback } from 'react'
import Step1RoleSelection from '@/components/onboarding/step-1-role-selection'
import Step2Profile from '@/components/onboarding/step-2-profile'
import Step3JobForm from '@/components/onboarding/step-3-job-form'
import Step3ServiceForm from '@/components/onboarding/step-3-service-form'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { Step, Role, ProfileFormData, JobFormData, ServiceFormData } from '@/types/onboarding'

const initialProfileData: ProfileFormData = {
  name: '',
  jobTitle: '',
  bio: '',
  location: '',
  website: '',
  twitter: '',
  linkedin: '',
  github: '',
}

const initialJobData: JobFormData = {
  jobTitle: '',
  description: '',
  budget: '',
  currency: 'US Dollar',
  paymentTokens: ['Ethereum (ETH)'],
  categories: [],
}

const initialServiceData: ServiceFormData = {
  serviceTitle: '',
  description: '',
  rate: '',
  rateType: 'Hourly',
  paymentTokens: ['Ethereum (ETH)'],
  categories: [],
}

const Onboarding = () => {
  const [step, setStep] = useState<Step>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>(initialProfileData)
  const [jobData, setJobData] = useState<JobFormData>(initialJobData)
  const [serviceData, setServiceData] = useState<ServiceFormData>(initialServiceData)

  const { fileUrl: profilePhoto, handleFileChange: handleProfilePhotoChange } = useFileUpload()
  const { fileUrl: bannerPhoto, handleFileChange: handleBannerPhotoChange } = useFileUpload()

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleJobInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleServiceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setServiceData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleContinue = useCallback(() => {
    if (step === 1 && selectedRole) {
      setStep(2)
    } else if (step === 2 && formData.name && formData.jobTitle) {
      setStep(3)
    }
  }, [step, selectedRole, formData.name, formData.jobTitle])

  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }, [step])

  const handleJobCurrencyChange = useCallback((currency: string) => {
    setJobData(prev => ({ ...prev, currency }))
  }, [])

  const handleServiceRateTypeChange = useCallback((rateType: 'Hourly' | 'Price') => {
    setServiceData(prev => ({ ...prev, rateType }))
  }, [])

  const handleJobTokenUpdate = useCallback((index: number, tokenName: string, tokenSymbol: string) => {
    setJobData(prev => {
      const newTokens = [...prev.paymentTokens]
      newTokens[index] = `${tokenName} (${tokenSymbol})`
      return { ...prev, paymentTokens: newTokens }
    })
  }, [])

  const handleServiceTokenUpdate = useCallback((index: number, tokenName: string, tokenSymbol: string) => {
    setServiceData(prev => {
      const newTokens = [...prev.paymentTokens]
      newTokens[index] = `${tokenName} (${tokenSymbol})`
      return { ...prev, paymentTokens: newTokens }
    })
  }, [])

  const handleJobAddToken = useCallback(() => {
    setJobData(prev => ({
      ...prev,
      paymentTokens: [...prev.paymentTokens, 'Ethereum (ETH)'],
    }))
  }, [])

  const handleServiceAddToken = useCallback(() => {
    setServiceData(prev => ({
      ...prev,
      paymentTokens: [...prev.paymentTokens, 'Ethereum (ETH)'],
    }))
  }, [])

  const handleJobRemoveToken = useCallback((index: number) => {
    setJobData(prev => ({
      ...prev,
      paymentTokens: prev.paymentTokens.filter((_, i) => i !== index),
    }))
  }, [])

  const handleServiceRemoveToken = useCallback((index: number) => {
    setServiceData(prev => ({
      ...prev,
      paymentTokens: prev.paymentTokens.filter((_, i) => i !== index),
    }))
  }, [])

  const handleJobToggleCategory = useCallback((category: string) => {
    setJobData(prev => {
      const isSelected = prev.categories.includes(category)
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter(c => c !== category)
          : [...prev.categories, category],
      }
    })
  }, [])

  const handleServiceToggleCategory = useCallback((category: string) => {
    setServiceData(prev => {
      const isSelected = prev.categories.includes(category)
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter(c => c !== category)
          : [...prev.categories, category],
      }
    })
  }, [])

  const handleJobRemoveCategory = useCallback((category: string) => {
    setJobData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }))
  }, [])

  const handleServiceRemoveCategory = useCallback((category: string) => {
    setServiceData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }))
  }, [])

  const handlePublishJob = useCallback(() => {
    console.log('Publishing job:', jobData)
  }, [jobData])

  const handleAddService = useCallback(() => {
    console.log('Adding service:', serviceData)
  }, [serviceData])

  // Render steps
  if (step === 1) {
    return (
      <Step1RoleSelection
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
        onContinue={handleContinue}
      />
    )
  }

  if (step === 2) {
    return (
      <Step2Profile
        formData={formData}
        profilePhoto={profilePhoto}
        bannerPhoto={bannerPhoto}
        onInputChange={handleInputChange}
        onProfilePhotoChange={handleProfilePhotoChange}
        onBannerPhotoChange={handleBannerPhotoChange}
        onBack={handleBack}
        onContinue={handleContinue}
      />
    )
  }

  if (step === 3) {
    if (selectedRole === 'client') {
      return (
        <Step3JobForm
          jobData={jobData}
          onInputChange={handleJobInputChange}
          onCurrencyChange={handleJobCurrencyChange}
          onUpdateToken={handleJobTokenUpdate}
          onAddToken={handleJobAddToken}
          onRemoveToken={handleJobRemoveToken}
          onToggleCategory={handleJobToggleCategory}
          onRemoveCategory={handleJobRemoveCategory}
          onBack={handleBack}
          onPublish={handlePublishJob}
        />
      )
    } else {
      return (
        <Step3ServiceForm
          serviceData={serviceData}
          onInputChange={handleServiceInputChange}
          onRateTypeChange={handleServiceRateTypeChange}
          onUpdateToken={handleServiceTokenUpdate}
          onAddToken={handleServiceAddToken}
          onRemoveToken={handleServiceRemoveToken}
          onToggleCategory={handleServiceToggleCategory}
          onRemoveCategory={handleServiceRemoveCategory}
          onBack={handleBack}
          onAddService={handleAddService}
        />
      )
    }
  }

  return null
}

export default Onboarding
