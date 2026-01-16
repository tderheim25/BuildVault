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
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a8a]/10 mb-4">
          <svg className="w-8 h-8 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600">No photos uploaded yet.</p>
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
            <div className="w-full h-full relative rounded-xl overflow-hidden border border-gray-200 hover:border-[#1e3a8a]/50 transition-all duration-200 ios-shadow hover:shadow-md">
              <img
                src={photo.url}
                alt={photo.file_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {canDelete && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this photo?')) {
                      onDelete(photo.id)
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
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
          <DialogContent className="max-w-4xl ios-card ios-shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-[#1e3a8a]">{selectedPhoto.file_name}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[60vh] rounded-xl overflow-hidden border border-gray-200">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.file_name}
                className="w-full h-full object-contain"
              />
            </div>
            {selectedPhoto.description && (
              <p className="text-sm text-gray-700 mt-4">{selectedPhoto.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Uploaded: {new Date(selectedPhoto.created_at).toLocaleString()}
            </p>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

