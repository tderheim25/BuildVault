'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Photo {
  id: string
  url: string
  file_name: string
  description?: string | null
  created_at: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  onDelete?: (photoId: string) => void
  canDelete?: boolean
}

export function PhotoGallery({ photos, onDelete, canDelete = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No photos uploaded yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="w-full h-full relative">
              <img
                src={photo.url}
                alt={photo.file_name}
                className="w-full h-full object-cover rounded-lg border hover:opacity-90 transition-opacity"
              />
              {canDelete && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this photo?')) {
                      onDelete(photo.id)
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.file_name}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[60vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.file_name}
                className="w-full h-full object-contain"
              />
            </div>
            {selectedPhoto.description && (
              <p className="text-sm text-gray-600 mt-4">{selectedPhoto.description}</p>
            )}
            <p className="text-xs text-gray-500">
              Uploaded: {new Date(selectedPhoto.created_at).toLocaleString()}
            </p>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

