export type Role = 'client' | 'freelancer'
export type Step = 1 | 2 | 3
export type RateType = 'Hourly' | 'Price'

export interface ProfileFormData {
  name: string
  jobTitle: string
  bio: string
  location: string
  website: string
  twitter: string
  linkedin: string
  github: string
}

export interface JobFormData {
  jobTitle: string
  description: string
  budget: string
  currency: string
  paymentTokens: string[]
  categories: string[]
}

export interface ServiceFormData {
  serviceTitle: string
  description: string
  rate: string
  rateType: RateType
  paymentTokens: string[]
  categories: string[]
}

export interface Step1RoleSelectionProps {
  selectedRole: Role | null
  onRoleSelect: (role: Role) => void
  onContinue: () => void
}

export interface Step2ProfileProps {
  formData: ProfileFormData
  profilePhoto: string | null
  bannerPhoto: string | null
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: () => void
  onContinue: () => void
}

export interface Step3JobFormProps {
  jobData: JobFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onCurrencyChange: (currency: string) => void
  onUpdateToken: (index: number, tokenName: string, tokenSymbol: string) => void
  onAddToken: () => void
  onRemoveToken: (index: number) => void
  onToggleCategory: (category: string) => void
  onRemoveCategory: (category: string) => void
  onBack: () => void
  onPublish: () => void
}

export interface Step3ServiceFormProps {
  serviceData: ServiceFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onRateTypeChange: (type: RateType) => void
  onUpdateToken: (index: number, tokenName: string, tokenSymbol: string) => void
  onAddToken: () => void
  onRemoveToken: (index: number) => void
  onToggleCategory: (category: string) => void
  onRemoveCategory: (category: string) => void
  onBack: () => void
  onAddService: () => void
}

