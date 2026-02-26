import { useState, useCallback } from 'react'

export const useFileUpload = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFileUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }, [])

  const resetFile = useCallback(() => {
    setFileUrl(null)
    setFile(null)
  }, [])

  return {
    fileUrl,
    file,
    handleFileChange,
    resetFile,
  }
}
