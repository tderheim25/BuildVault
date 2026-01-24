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
  uploaded_by: string
  uploader?: {
    full_name: string | null
    email: string
  }
}

interface PhotoGalleryClientProps {
  photos: Photo[]
  currentUserId: string
  currentUserRole: 'admin' | 'manager' | 'staff'
  siteOwnerId: string
  siteId: string
}

export function PhotoGalleryClient({
  photos: initialPhotos,
  currentUserId,
  currentUserRole,
  siteOwnerId,
  siteId,
}: PhotoGalleryClientProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState(initialPhotos)

  const canDeleteAnyInProject = currentUserRole === 'admin' || currentUserRole === 'manager' || siteOwnerId === currentUserId

  const handleDelete = async (photoId: string) => {
    try {
      const supabase = createClient()
      
      // Get the photo to verify ownership
      const photo = photos.find(p => p.id === photoId)
      if (!photo) {
        throw new Error('Photo not found')
      }

      const canDeleteThis = canDeleteAnyInProject || photo.uploaded_by === currentUserId
      if (!canDeleteThis) {
        alert('You do not have permission to delete this photo')
        return
      }

      // Extract file path from URL to delete from storage
      const urlParts = photo.url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${siteId}/${fileName}`

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-photos')
        .remove([filePath])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error

      setPhotos(prev => prev.filter(p => p.id !== photoId))
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting photo:', error)
      alert(error.message || 'Failed to delete photo')
    }
  }

  // Create a map of which photos can be deleted by the current user
  const deletablePhotos = new Set(
    photos
      .filter(photo => canDeleteAnyInProject || photo.uploaded_by === currentUserId)
      .map(photo => photo.id)
  )

  return (
    <PhotoGallery 
      photos={photos}
      onDelete={handleDelete}
      deletablePhotoIds={deletablePhotos}
    />
  )
}




