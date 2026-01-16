'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PhotoUploadProps {
  siteId: string
  onUploadComplete?: () => void
}

export function PhotoUpload({ siteId, onUploadComplete }: PhotoUploadProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      // Filter to only image files
      const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'))
      setFiles(prev => [...prev, ...imageFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${siteId}/${fileName}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('project-photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-photos')
          .getPublicUrl(filePath)

        // Insert photo record
        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            site_id: siteId,
            url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          })

        if (insertError) throw insertError
      })

      await Promise.all(uploadPromises)
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploadComplete?.()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="photos" className="text-gray-700">Upload Photos</Label>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="mt-2 rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1e3a8a] file:text-white hover:file:bg-[#1e40af] file:cursor-pointer cursor-pointer"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{files.length} file(s) selected</p>
          <div className="grid grid-cols-4 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-xl border border-gray-200 group-hover:border-[#1e3a8a]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-sm transition-all"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ios-button"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} Photo(s)`}
          </Button>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}
    </div>
  )
}

