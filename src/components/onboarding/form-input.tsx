'use client'

import React, { useState } from 'react'
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
  startContent =  false,
  autoComplete = 'off'
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div>
      {label && <label className="mb-2 block xs:text-[14px] text-sm font-medium text-[#212121]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>}
      <div className='flex'>
{startContent && <div className={`rounded-l-[8px] pl-[10px] border-[1px] border-r-0 flex items-center text-[14px] font-normal leading-[14.52px] transition-colors duration-200 ${isFocused ? 'border-gray-600 text-gray-900' : 'border-gray-300 text-[#707070]'}`}>
              {startContent}
            </div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        required={required}
        className={`form-input w-full xs:rounded-[8px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none ${startContent && 'border-l-0 xs:rounded-s-none rounded-s-none'} ${className}`}
        />
        </div>
    </div>
  )
}

export default FormInput
