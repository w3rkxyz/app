'use client'

import React from 'react'
import type { FormSelectProps } from '@/types/components'

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  options = [],
  required = false,
  className = '',
}) => {
  return (
    <div>
      {label && (
        <label className="mb-2 block xs:text-[14px] text-sm font-medium text-[#212121]">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full xs:rounded-[8px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-[#9CA3AF] placeholder-gray-400 focus:border-gray-600 focus:outline-none ${className}`}
      >
        {placeholder && (
          <option className='text-[#9CA3AF]' value="" disabled selected hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FormSelect
