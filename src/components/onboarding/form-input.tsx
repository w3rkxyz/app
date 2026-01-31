'use client'

import React from 'react'
import type { FormInputProps } from '@/types/components'

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  className = '',
}) => {
  return (
    <div>
      <label className="mb-2 block xs:text-[14px] text-sm font-medium text-[#212121]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full xs:rounded-[8px] rounded-lg border xs:border-[0.5px] border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none  ${className}`}
      />
    </div>
  )
}

export default FormInput

