'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PhotoGallery } from '@/components/PhotoGallery'

interface Photo {
  id: string
  url: string
  file_name: string
  description?: string | null
  created_at: string
}

interface PhotoGalleryClientProps {
  photos: Photo[]
  canDelete: boolean
}

export function PhotoGalleryClient({ photos: initialPhotos, canDelete }: PhotoGalleryClientProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState(initialPhotos)

  const handleDelete = async (photoId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error

      setPhotos(prev => prev.filter(p => p.id !== photoId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo')
    }
  }

  return (
    <PhotoGallery 
      photos={photos}
      onDelete={canDelete ? handleDelete : undefined}
      canDelete={canDelete}
    />
  )
}


