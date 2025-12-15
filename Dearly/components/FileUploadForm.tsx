'use client'

import { useState } from 'react'
import { uploadAudioFile, uploadTranscriptFile, processRecording } from '@/app/actions/recordings'

interface FileUploadFormProps {
  sessionId: string
  onUploadComplete: () => void
}

export default function FileUploadForm({ sessionId, onUploadComplete }: FileUploadFormProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFile || !transcriptFile) {
      setError('Please select both audio and transcript files')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Upload audio file
      setCurrentStep('Uploading audio file...')
      setUploadProgress(10)

      const audioFormData = new FormData()
      audioFormData.append('audio', audioFile)

      const audioResult = await uploadAudioFile(sessionId, audioFormData)
      if (!audioResult.success) {
        setError(audioResult.error || 'Audio upload failed')
        setUploading(false)
        return
      }

      setUploadProgress(40)

      // Upload transcript file
      setCurrentStep('Uploading transcript file...')

      const transcriptFormData = new FormData()
      transcriptFormData.append('transcript', transcriptFile)

      const transcriptResult = await uploadTranscriptFile(sessionId, transcriptFormData)
      if (!transcriptResult.success) {
        setError(transcriptResult.error || 'Transcript upload failed')
        setUploading(false)
        return
      }

      setUploadProgress(70)

      // Trigger processing
      setCurrentStep('Starting AI processing...')

      const processResult = await processRecording(sessionId)
      if (!processResult.success) {
        setError(processResult.error || 'Processing failed to start')
        setUploading(false)
        return
      }

      setUploadProgress(100)
      setCurrentStep('Upload complete!')

      // Wait a moment to show completion
      setTimeout(() => {
        onUploadComplete()
        setUploading(false)
        setCurrentStep('')
      }, 1000)
    } catch (err) {
      console.error('Upload error:', err)
      setError('An unexpected error occurred')
      setUploading(false)
      setCurrentStep('')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Audio File Input */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
          Audio Recording (MP3, WAV)
        </label>
        <input
          type="file"
          accept="audio/mp3,audio/mpeg,audio/wav,audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          disabled={uploading}
          className="w-full px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2"
          style={{
            borderColor: '#0b4e9d',
            backgroundColor: '#f4f1ea'
          }}
        />
        {audioFile && (
          <p className="mt-2 text-sm" style={{ color: '#737373' }}>
            <span className="font-medium">{audioFile.name}</span> ({formatFileSize(audioFile.size)})
          </p>
        )}
      </div>

      {/* Transcript File Input */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#0b4e9d' }}>
          Transcript File (TXT, VTT, SRT)
        </label>
        <input
          type="file"
          accept=".txt,.vtt,.srt,text/plain"
          onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
          disabled={uploading}
          className="w-full px-4 py-3 border-2 rounded-lg transition focus:outline-none focus:ring-2"
          style={{
            borderColor: '#0b4e9d',
            backgroundColor: '#f4f1ea'
          }}
        />
        {transcriptFile && (
          <p className="mt-2 text-sm" style={{ color: '#737373' }}>
            <span className="font-medium">{transcriptFile.name}</span> ({formatFileSize(transcriptFile.size)})
          </p>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 transition-all duration-300 rounded-full"
              style={{
                width: `${uploadProgress}%`,
                backgroundColor: '#B7CF3F'
              }}
            />
          </div>
          {currentStep && (
            <p className="text-sm text-center font-medium" style={{ color: '#0b4e9d' }}>
              {currentStep}
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#fff5f5', borderColor: '#FF5E33' }}>
          <p className="text-sm font-medium" style={{ color: '#FF5E33' }}>
            {error}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || !audioFile || !transcriptFile}
        className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        style={{
          backgroundColor: uploading || !audioFile || !transcriptFile ? '#cccccc' : '#0b4e9d',
          color: '#ffffff'
        }}
      >
        {uploading ? 'Uploading & Processing...' : 'Upload & Process Recording'}
      </button>

      {/* Helper Text */}
      <p className="text-xs text-center" style={{ color: '#737373' }}>
        Files will be securely uploaded and processed. The AI will automatically analyze the transcript
        and match segments to interview questions.
      </p>
    </form>
  )
}
