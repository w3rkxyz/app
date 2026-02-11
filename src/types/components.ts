export interface FormInputProps {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
  className?: string,
  startContent?: React.ReactNode
}

export interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  maxLength?: number
  rows?: number
  required?: boolean
  showCharCount?: boolean
}

export interface FormSelectProps {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  options: Array<{ value: string; label: string }>
  required?: boolean
  className?: string
}

