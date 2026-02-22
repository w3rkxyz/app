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
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full xs:rounded-[8px] rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-[#9CA3AF] placeholder-gray-400 focus:border-gray-600 focus:outline-none appearance-none ${className}`}
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
        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default FormSelect