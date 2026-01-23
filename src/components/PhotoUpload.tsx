'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import imageCompression from 'browser-image-compression'

interface PhotoUploadProps {
  siteId: string
  onUploadComplete?: () => void
}

export function PhotoUpload({ siteId, onUploadComplete }: PhotoUploadProps) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
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

  const optimizeImage = async (file: File): Promise<File> => {
    // Only optimize if file is larger than 500KB
    if (file.size < 500 * 1024) {
      return file
    }

    // Determine if we should preserve PNG format (for transparency)
    // or convert to JPEG (for photos)
    const isPNG = file.type === 'image/png'
    const shouldPreserveFormat = isPNG

    const options = {
      maxSizeMB: 2, // Maximum size in MB
      maxWidthOrHeight: 1920, // Maximum width or height (good for web display)
      useWebWorker: true, // Use web worker for better performance
      initialQuality: 0.9, // 90% quality - maintains excellent visual quality
      alwaysKeepResolution: false, // Allow resizing if needed
      ...(shouldPreserveFormat 
        ? { fileType: 'image/png' } // Preserve PNG for transparency
        : { fileType: 'image/jpeg' } // Convert photos to JPEG for better compression
      ),
    }

    try {
      const compressedFile = await imageCompression(file, options)
      
      // Log compression ratio for debugging
      const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1)
      if (compressedFile.size < file.size) {
        console.log(`Optimized ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`)
      }
      
      return compressedFile
    } catch (error) {
      console.error('Image optimization failed:', error)
      // Return original file if optimization fails
      return file
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setOptimizing(true)
    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Optimize all images first
      const optimizedFiles = await Promise.all(
        files.map(file => optimizeImage(file))
      )

      setOptimizing(false)

      const uploadPromises = optimizedFiles.map(async (file, index) => {
        // Use .jpg extension for optimized files to ensure proper MIME type
        const fileExt = file.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop()
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

        // Insert photo record with optimized file size
        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            site_id: siteId,
            url: publicUrl,
            file_name: files[index].name, // Keep original filename
            file_size: file.size, // Use optimized file size
            mime_type: file.type, // Use optimized MIME type
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
      setOptimizing(false)
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
            disabled={uploading || optimizing}
            className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ios-button"
          >
            {optimizing 
              ? 'Optimizing...' 
              : uploading 
                ? 'Uploading...' 
                : `Upload ${files.length} Photo(s)`}
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

