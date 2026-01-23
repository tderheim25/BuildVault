'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, X, Check } from 'lucide-react'

interface CaptureClientProps {
  initialProjects: Array<{ id: string; name: string }>
}

export function CaptureClient({ initialProjects }: CaptureClientProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<string>(initialProjects.length > 0 ? initialProjects[0].id : '')
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload' | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([]) // Gallery of captured images
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Update selected project if initial projects change
    if (initialProjects.length > 0 && !selectedProject) {
      setSelectedProject(initialProjects[0].id)
    }
    setProjects(initialProjects)
  }, [initialProjects])

  const startCamera = async () => {
    try {
      setError(null)
      setCaptureMode('camera')
      setCameraReady(false)
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera API not supported in this browser. Please use a modern browser.')
        return
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera on mobile, fallback to any
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      // Set the stream to video element immediately
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error('Video play error:', err)
              setError('Unable to start camera preview. Please try again.')
            })
          }
        }
        
        // Try to play immediately as well
        videoRef.current.play().catch(err => {
          console.error('Immediate play error:', err)
          // This is okay, it will play when metadata loads
        })
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      setCaptureMode(null)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is being used by another application. Please close it and try again.')
      } else {
        setError(`Unable to access camera: ${err.message || 'Unknown error'}. Please check your browser permissions.`)
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraReady(false)
    setCaptureMode(null)
    setCapturedImage(null)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Check if video is ready
      if (video.readyState >= video.HAVE_METADATA) {
        canvas.width = video.videoWidth || video.clientWidth
        canvas.height = video.videoHeight || video.clientHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Draw image without mirroring (captured image should not be mirrored)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
          setCapturedImage(imageDataUrl)
        }
      } else {
        setError('Camera is not ready yet. Please wait a moment and try again.')
      }
    } else {
      setError('Camera stream not available. Please try opening the camera again.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      )
      setUploadedFiles(prev => [...prev, ...selectedFiles])
      setCaptureMode('upload')
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeCapturedImage = () => {
    setCapturedImage(null)
    // Restart camera if stream exists
    if (stream && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err)
      })
    }
  }

  const addToGallery = () => {
    if (capturedImage) {
      setCapturedImages(prev => [...prev, capturedImage])
      setCapturedImage(null)
      // Resume video preview for capturing another photo
      if (stream && videoRef.current) {
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err)
        })
      }
    }
  }

  const removeFromGallery = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index))
  }

  const convertDataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const handleUpload = async () => {
    if (!selectedProject) {
      setError('Please select a project')
      return
    }

    const filesToUpload: File[] = []
    
    // Add current captured image if exists
    if (capturedImage) {
      const file = convertDataUrlToFile(capturedImage, `capture-${Date.now()}.jpg`)
      filesToUpload.push(file)
    }
    
    // Add all images from gallery
    capturedImages.forEach((img, index) => {
      const file = convertDataUrlToFile(img, `capture-${Date.now()}-${index}.jpg`)
      filesToUpload.push(file)
    })
    
    // Add uploaded files
    filesToUpload.push(...uploadedFiles)

    if (filesToUpload.length === 0) {
      setError('Please capture or select at least one photo')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const uploadPromises = filesToUpload.map(async (file) => {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${selectedProject}/${fileName}`

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
            site_id: selectedProject,
            url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          })

        if (insertError) throw insertError
      })

      await Promise.all(uploadPromises)
      
      // Reset state
      setCapturedImage(null)
      setCapturedImages([])
      setUploadedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      stopCamera()
      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        router.push(`/projects/${selectedProject}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gradient">
          Capture Photos
        </h1>
        <p className="text-gray-600 text-lg">Take photos with your camera or upload from device</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Capture Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Selection */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Select Project</CardTitle>
              <CardDescription className="text-gray-600">Choose which project to add photos to</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {projects.length === 0 ? (
                  <option value="">No projects available</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                )}
              </select>
            </CardContent>
          </Card>

          {/* Capture Options */}
          {!captureMode && (
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Capture Method</CardTitle>
                <CardDescription className="text-gray-600">Choose how you want to add photos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={startCamera}
                    className="h-32 flex-col gap-3 gradient-primary hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-lg font-semibold">Open Camera</span>
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-32 flex-col gap-3 border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                  >
                    <Upload className="h-8 w-8 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-700">Upload Photos</span>
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* Camera View */}
          {captureMode === 'camera' && (
            <Card className="dashboard-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-900">Camera</CardTitle>
                  <Button
                    onClick={stopCamera}
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                  {!capturedImage ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          const video = e.currentTarget
                          video.play().catch(err => {
                            console.error('Video play error:', err)
                            setError('Unable to play camera feed. Please try again.')
                          })
                          setCameraReady(true)
                        }}
                        onCanPlay={() => {
                          if (videoRef.current) {
                            videoRef.current.play().catch(err => {
                              console.error('Video play error:', err)
                            })
                          }
                          setCameraReady(true)
                        }}
                        onPlaying={() => {
                          setCameraReady(true)
                        }}
                      />
                      {stream && !cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Loading camera...</p>
                          </div>
                        </div>
                      )}
                      {!stream && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm opacity-75">Click "Open Camera" to start</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3">
                  {!capturedImage ? (
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 gradient-primary hover:opacity-90 text-white rounded-xl shadow-md"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Photo
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          removeCapturedImage()
                        }}
                        variant="outline"
                        className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Retake
                      </Button>
                      <Button
                        onClick={addToGallery}
                        className="flex-1 gradient-primary hover:opacity-90 text-white rounded-xl shadow-md"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Capture Another
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Upload View */}
          {captureMode === 'upload' && uploadedFiles.length > 0 && (
            <Card className="dashboard-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-gray-900">Selected Photos</CardTitle>
                  <Button
                    onClick={() => {
                      setUploadedFiles([])
                      setCaptureMode(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full mt-4 rounded-xl"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Add More Photos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Upload Actions */}
        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Ready to Upload</CardTitle>
              <CardDescription className="text-gray-600">
                {(capturedImage ? 1 : 0) + capturedImages.length + uploadedFiles.length} photo(s) ready
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Thumbnails */}
              {(capturedImage || capturedImages.length > 0 || uploadedFiles.length > 0) && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 -m-2">
                    {/* Current captured image */}
                    {capturedImage && (
                      <div className="relative aspect-square group">
                        <img
                          src={capturedImage}
                          alt="Current capture"
                          className="w-full h-full object-cover rounded-lg border-2 border-indigo-500"
                        />
                        <div className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                          New
                        </div>
                      </div>
                    )}
                    {/* Gallery images */}
                    {capturedImages.map((img, index) => (
                      <div key={`gallery-${index}`} className="relative aspect-square group">
                        <img
                          src={img}
                          alt={`Captured ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-1 left-1 bg-gray-800/70 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    {/* Uploaded files */}
                    {uploadedFiles.map((file, index) => (
                      <div key={`upload-${index}`} className="relative aspect-square group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute top-1 left-1 bg-blue-500/70 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                          {capturedImages.length + index + (capturedImage ? 1 : 0) + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <span>Photos uploaded successfully! Redirecting...</span>
                </div>
              )}
              <Button
                onClick={handleUpload}
                disabled={uploading || (!capturedImage && capturedImages.length === 0 && uploadedFiles.length === 0) || !selectedProject}
                className="w-full gradient-primary hover:opacity-90 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload {(capturedImage ? 1 : 0) + capturedImages.length + uploadedFiles.length} Photo(s)
                  </>
                )}
              </Button>
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  No projects available. Create a project first.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
