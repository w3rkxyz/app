import { useState, useCallback } from 'react'

export const useFileUpload = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFileUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const resetFile = useCallback(() => {
    setFileUrl(null)
  }, [])

  return {
    fileUrl,
    handleFileChange,
    resetFile,
  }
}

