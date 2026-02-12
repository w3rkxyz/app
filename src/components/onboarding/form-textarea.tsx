'use client'

import React from 'react'
import type { FormTextareaProps } from '@/types/components'

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength = 800,
  rows = 6,
  required = false,
  showCharCount = true,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#212121]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          required={required}
          className="w-full xs:rounded-[8px] rounded-lg border xs:border-[0.5px] border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none resize-none"
        />
        {showCharCount && (
          <div className="absolute bottom-2 right-2 text-xs xs:text-[12px] text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormTextarea

