'use client'

import React, { useState, useCallback } from 'react'
import Step1RoleSelection from '@/components/onboarding/step-1-role-selection'
import Step2Profile from '@/components/onboarding/step-2-profile'
import Step3JobForm from '@/components/onboarding/step-3-job-form'
import Step3ServiceForm from '@/components/onboarding/step-3-service-form'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { Step, Role, ProfileFormData, JobFormData, ServiceFormData } from '@/types/onboarding'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useWalletClient } from 'wagmi'
import { toast } from 'react-hot-toast'
import { account, MetadataAttributeType, textOnly } from '@lens-protocol/metadata'
import { uri } from '@lens-protocol/client'
import { post, setAccountMetadata } from '@lens-protocol/client/actions'
import { handleOperationWith } from '@lens-protocol/client/viem'
import { getLensClient } from '@/client'
import { uploadFileToLensStorage, uploadMetadataToLensStorage } from '@/utils/storage-client'
import { appendOnboardingFeedPost } from '@/utils/onboardingPosts'
import { setLensProfile } from '@/redux/app'
import type { RootState } from '@/redux/store'

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
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: walletClient } = useWalletClient()
  const profile = useSelector((state: RootState) => state.app.user)

  const [step, setStep] = useState<Step>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>(initialProfileData)
  const [jobData, setJobData] = useState<JobFormData>(initialJobData)
  const [serviceData, setServiceData] = useState<ServiceFormData>(initialServiceData)
  const [savingProfile, setSavingProfile] = useState(false)
  const [submittingPost, setSubmittingPost] = useState(false)

  const {
    fileUrl: profilePhoto,
    file: profilePhotoFile,
    handleFileChange: handleProfilePhotoChange,
  } = useFileUpload()
  const {
    fileUrl: bannerPhoto,
    file: bannerPhotoFile,
    handleFileChange: handleBannerPhotoChange,
  } = useFileUpload()

  const normalizeUri = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return trimmed

    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return trimmed
    }

    const ipfsPathMatch = trimmed.match(/^\/?ipfs\/(.+)$/i)
    if (ipfsPathMatch?.[1]) {
      return `ipfs://${ipfsPathMatch[1]}`
    }

    if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[1-9A-HJ-NP-Za-km-z]+)$/i.test(trimmed)) {
      return `ipfs://${trimmed}`
    }

    return trimmed
  }, [])

  const resolveSessionClient = useCallback(async () => {
    const lensClient = await getLensClient()
    if (!lensClient.isSessionClient()) {
      toast.error('Please login again to continue onboarding.')
      return null
    }
    return lensClient
  }, [])

  const resolveProfilePath = useCallback(() => {
    const handle =
      profile?.userLink ||
      profile?.handle?.replace(/^@/, '') ||
      (typeof window !== 'undefined'
        ? (window.localStorage.getItem('activeHandle') || '').replace(/^@/, '')
        : '')

    if (handle) {
      return `/u/${handle}`
    }
    return '/settings'
  }, [profile?.handle, profile?.userLink])

  const extractTokenSymbols = useCallback((tokens: string[]) => {
    return tokens
      .map(token => {
        const match = token.match(/\(([^)]+)\)/)
        return match?.[1] || token
      })
      .join(', ')
  }, [])

  const persistProfileData = useCallback(async () => {
    const sessionClient = await resolveSessionClient()
    if (!sessionClient) {
      return false
    }

    if (!walletClient) {
      toast.error('Wallet not ready. Please reconnect and try again.')
      return false
    }

    setSavingProfile(true)

    try {
      let pictureUri = profilePhoto || ''
      let coverUri = bannerPhoto || ''

      if (profilePhotoFile) {
        pictureUri = await uploadFileToLensStorage(profilePhotoFile)
      }

      if (bannerPhotoFile) {
        coverUri = await uploadFileToLensStorage(bannerPhotoFile)
      }

      const attributes = [
        { key: 'location', value: formData.location.trim(), type: MetadataAttributeType.STRING },
        { key: 'website', value: formData.website.trim(), type: MetadataAttributeType.STRING },
        { key: 'job title', value: formData.jobTitle.trim(), type: MetadataAttributeType.STRING },
        { key: 'x', value: formData.twitter.trim(), type: MetadataAttributeType.STRING },
        { key: 'linkedin', value: formData.linkedin.trim(), type: MetadataAttributeType.STRING },
        { key: 'github', value: formData.github.trim(), type: MetadataAttributeType.STRING },
      ].filter(attribute => attribute.value !== '')

      const metadata = account({
        name: formData.name.trim() !== '' ? formData.name.trim() : undefined,
        bio: formData.bio.trim() !== '' ? formData.bio.trim() : undefined,
        picture: pictureUri !== '' ? pictureUri : undefined,
        coverPicture: coverUri !== '' ? coverUri : undefined,
        attributes: attributes.length > 0 ? attributes : undefined,
      })

      const metadataUriValue = await uploadMetadataToLensStorage(metadata)
      const result = await setAccountMetadata(sessionClient, {
        metadataUri: uri(normalizeUri(metadataUriValue)),
      }).andThen(handleOperationWith(walletClient))

      if (result.isErr()) {
        toast.error(result.error.message)
        return false
      }

      if (profile) {
        dispatch(
          setLensProfile({
            profile: {
              ...profile,
              displayName: formData.name || profile.displayName,
              picture: pictureUri || profile.picture,
              coverPicture: coverUri || profile.coverPicture,
              bio: formData.bio || profile.bio,
              attributes: {
                ...profile.attributes,
                location: formData.location,
                website: formData.website,
                'job title': formData.jobTitle,
                x: formData.twitter,
                linkedin: formData.linkedin,
                github: formData.github,
              },
            },
          })
        )
      }

      toast.success('Profile details saved')
      return true
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save profile details')
      return false
    } finally {
      setSavingProfile(false)
    }
  }, [
    resolveSessionClient,
    walletClient,
    profilePhoto,
    bannerPhoto,
    profilePhotoFile,
    bannerPhotoFile,
    formData,
    normalizeUri,
    profile,
    dispatch,
  ])

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

  const handleContinue = useCallback(async () => {
    if (savingProfile || submittingPost) {
      return
    }

    if (step === 1 && selectedRole) {
      setStep(2)
      return
    }

    if (step === 2 && formData.name && formData.jobTitle) {
      const saved = await persistProfileData()
      if (saved) {
        setStep(3)
      }
    }
  }, [step, selectedRole, formData.name, formData.jobTitle, persistProfileData, savingProfile, submittingPost])

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

  const handleSkipStep3 = useCallback(() => {
    if (savingProfile || submittingPost) {
      return
    }
    router.push(resolveProfilePath())
  }, [savingProfile, submittingPost, router, resolveProfilePath])

  const handlePublishPost = useCallback(async () => {
    if (savingProfile || submittingPost || !selectedRole) {
      return
    }

    const sessionClient = await resolveSessionClient()
    if (!sessionClient) {
      return
    }

    setSubmittingPost(true)

    try {
      const isJob = selectedRole === 'client'
      const title = isJob ? jobData.jobTitle.trim() : serviceData.serviceTitle.trim()
      const description = isJob ? jobData.description.trim() : serviceData.description.trim()
      const tags = isJob ? jobData.categories : serviceData.categories
      const paymentAmount = isJob ? jobData.budget.trim() : serviceData.rate.trim()
      const paymentType = isJob
        ? 'fixed'
        : serviceData.rateType === 'Hourly'
          ? 'hourly'
          : 'fixed'
      const selectedTokens = isJob ? jobData.paymentTokens : serviceData.paymentTokens
      const paidIn = extractTokenSymbols(selectedTokens)
      const postType = isJob ? 'job' : 'service'
      const activeHandle = (profile?.userLink || profile?.handle || '@user').replace(/^@/, '')

      const publicContent = `${isJob ? '📢 Job Opportunity!' : '🛠 Ready for work!'} \n\n${
        isJob
          ? `Just posted a job on @w3rkxyz for a ${title}`
          : `Just listed my services on @w3rkxyz as a ${title}`
      }\n\nFor more details please visit www.w3rk.xyz/${activeHandle}`

      const metadata = textOnly({
        content: publicContent,
        tags: [...tags, postType, 'w3rk'],
        attributes: [
          {
            key: 'paid in',
            value: paidIn,
            type: MetadataAttributeType.STRING,
          },
          {
            key: 'payement type',
            value: paymentType,
            type: MetadataAttributeType.STRING,
          },
          {
            key: paymentType,
            value: paymentAmount,
            type: MetadataAttributeType.STRING,
          },
          {
            key: 'post type',
            value: postType,
            type: MetadataAttributeType.STRING,
          },
          {
            key: 'title',
            value: title,
            type: MetadataAttributeType.STRING,
          },
          {
            key: 'content',
            value: description,
            type: MetadataAttributeType.STRING,
          },
        ],
      })

      const metadataUri = await uploadMetadataToLensStorage(metadata)
      const publishResult = await post(sessionClient, {
        contentUri: uri(metadataUri),
      })

      if (publishResult.isErr()) {
        toast.error(publishResult.error.message)
        return
      }

      appendOnboardingFeedPost({
        type: postType,
        username: profile?.displayName || activeHandle || 'User',
        profileImage: profile?.picture || 'https://static.hey.xyz/images/default.png',
        jobName: title,
        jobIcon: '',
        description,
        contractType: paymentType,
        paymentAmount: paymentType === 'hourly' ? `$${paymentAmount}/hr` : `$${paymentAmount}`,
        paidIn,
        tags,
      })

      toast.success(isJob ? 'Job published successfully' : 'Service added successfully')
      router.push(isJob ? '/find-work' : '/find-talent')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to publish post')
    } finally {
      setSubmittingPost(false)
    }
  }, [
    savingProfile,
    submittingPost,
    selectedRole,
    resolveSessionClient,
    jobData,
    serviceData,
    extractTokenSymbols,
    profile?.userLink,
    profile?.handle,
    profile?.displayName,
    profile?.picture,
    router,
  ])

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
        onContinue={() => {
          void handleContinue()
        }}
        saving={savingProfile}
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
          onSkip={handleSkipStep3}
          onPublish={() => {
            void handlePublishPost()
          }}
          submitting={savingProfile || submittingPost}
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
          onSkip={handleSkipStep3}
          onAddService={() => {
            void handlePublishPost()
          }}
          submitting={savingProfile || submittingPost}
        />
      )
    }
  }

  return null
}

export default Onboarding
