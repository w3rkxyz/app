'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X, Code, Palette, MessageCircle, TrendingUp, Headphones, Shield, Users, HelpCircle } from 'lucide-react'
import { categoryOptions as categoryOptionsData } from '@/utils/constants'

const categoryOptions = categoryOptionsData.map(cat => {
  const iconMap: Record<string, any> = {
    'Programming & Development': Code,
    'Design': Palette,
    'Consulting & Advisory': MessageCircle,
    'Marketing': TrendingUp,
    'Admin Support': Headphones,
    'Customer Service': MessageCircle,
    'Security & Auditing': Shield,
    'Community Building': Users,
    'Other': HelpCircle,
  }
  return {
    ...cat,
    IconComponent: iconMap[cat.name] || null,
  }
})

interface CategorySelectorProps {
  selectedCategories: string[]
  onToggleCategory: (category: string) => void
  onRemoveCategory: (category: string) => void
  label: string
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onToggleCategory,
  onRemoveCategory,
  label,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  const filteredCategories = categoryOptions.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false)
        setCategorySearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-medium text-gray-900">
        {label}<span className="text-red-500">*</span>
      </label>
      <p className="mb-3 text-sm text-gray-500">Select minimum one category</p>
      
      <div className="relative" ref={categoryDropdownRef}>
        <button
          type="button"
          onClick={() => {
            setShowCategoryDropdown(!showCategoryDropdown)
            setCategorySearch('')
          }}
          className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-colors"
        >
          <div className="flex flex-wrap gap-2 flex-1">
            {selectedCategories.length === 0 ? (
              <span className="text-gray-500 text-sm">Select categories...</span>
            ) : (
              selectedCategories.map(category => {
                const categoryInfo = categoryOptions.find(c => c.name === category)
                const IconComp = categoryInfo?.IconComponent
                return (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-primary-black font-medium"
                  >
                    {/* {IconComp && <IconComp size={14} />} */}
                    {category}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveCategory(category)
                      }}
                      className="text-gray-500 hover:text-gray-700 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )
              })
            )}
          </div>
          <ChevronDown 
            size={18} 
            className={`text-gray-400 ml-2 flex-shrink-0 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showCategoryDropdown && (
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200">
              <div className="relative">
                <Search 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search Category"
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  className="w-full rounded-md py-3 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-0"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {filteredCategories
                .filter(cat => !selectedCategories.includes(cat.name))
                .map(category => {
                  const IconComp = category.IconComponent
                  return (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => {
                        onToggleCategory(category.name)
                        setCategorySearch('')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {IconComp ? (
                        <IconComp size={16} className="text-gray-600 flex-shrink-0" />
                      ) : (
                        <span className="text-gray-600 flex-shrink-0 text-sm">{category.icon}</span>
                      )}
                      <span className="text-sm">{category.name}</span>
                    </button>
                  )
                })}
              {filteredCategories.filter(cat => !selectedCategories.includes(cat.name)).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategorySelector