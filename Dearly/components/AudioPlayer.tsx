'use client'

import { useState, useRef, useEffect } from 'react'

interface Segment {
  id: string
  question_id: string | null
  start_time: number
  end_time: number
  text: string
  sequence_order: number
}

interface Question {
  id: string
  text: string
}

interface AudioPlayerProps {
  audioUrl: string
  intervieweeName: string
  relationship: string
  questions: Question[]
  segments: Segment[]
}

export default function AudioPlayer({
  audioUrl,
  intervieweeName,
  relationship,
  questions,
  segments
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)

  // Update current time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)
    const handleEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Find current segment based on time
  useEffect(() => {
    const segment = segments.find(
      s => currentTime >= s.start_time && currentTime <= s.end_time
    )

    if (segment) {
      setCurrentSegment(segment)
      if (segment.question_id) {
        const question = questions.find(q => q.id === segment.question_id)
        if (question) {
          setCurrentQuestion(question)
        }
      }
    }
  }, [currentTime, segments, questions])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const jumpToQuestion = (questionId: string) => {
    const segment = segments.find(s => s.question_id === questionId)
    if (segment && audioRef.current) {
      audioRef.current.currentTime = segment.start_time
      setCurrentTime(segment.start_time)
      if (!playing) {
        audioRef.current.play()
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!duration || !isFinite(duration)) return 0
    return (currentTime / duration) * 100
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-8 md:p-10" style={{ backgroundColor: '#f4f1ea' }}>
        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#0b4e9d' }}>
          {intervieweeName}
        </h2>
        <p className="text-lg md:text-xl" style={{ color: '#737373' }}>
          {relationship}
        </p>
      </div>

      {/* Audio Controls */}
      <div className="p-8 md:p-10">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Play/Pause Button and Progress */}
        <div className="flex items-center gap-4 md:gap-6 mb-8">
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#0b4e9d' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 md:w-7 md:h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0b4e9d 0%, #0b4e9d ${getProgressPercentage()}%, #e5e7eb ${getProgressPercentage()}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm mt-2" style={{ color: '#737373' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Current Question Display */}
        {currentQuestion && (
          <div className="mb-8 p-5 md:p-6 rounded-xl border-2" style={{
            backgroundColor: '#f4f1ea',
            borderColor: '#B7CF3F'
          }}>
            <p className="text-xs md:text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: '#B7CF3F' }}>
              Currently Playing
            </p>
            <p className="text-base md:text-lg font-semibold leading-relaxed" style={{ color: '#0b4e9d' }}>
              {currentQuestion.text}
            </p>
          </div>
        )}

        {/* Synchronized Transcript */}
        {currentSegment && (
          <div className="mb-8 p-5 md:p-6 rounded-xl border-l-4" style={{
            backgroundColor: '#f9fafb',
            borderColor: '#B7CF3F'
          }}>
            <p className="text-xs md:text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: '#737373' }}>
              Transcript
            </p>
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#0b4e9d' }}>
              {currentSegment.text}
            </p>
          </div>
        )}

        {/* Question List - Jump Navigation */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg md:text-xl mb-4" style={{ color: '#0b4e9d' }}>
            Jump to Question
          </h3>
          <div className="space-y-2">
            {questions.map((q, index) => {
              const questionSegment = segments.find(s => s.question_id === q.id)
              const isActive = currentQuestion?.id === q.id

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(q.id)}
                  disabled={!questionSegment}
                  className={`w-full text-left p-4 md:p-5 rounded-xl transition-all duration-200 ${
                    questionSegment
                      ? 'hover:shadow-md cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#0b4e9d' : '#f4f1ea',
                    color: isActive ? '#ffffff' : '#0b4e9d',
                    border: isActive ? 'none' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-sm font-bold opacity-75">
                      Q{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm md:text-base leading-relaxed">
                        {q.text}
                      </p>
                      {questionSegment && !isActive && (
                        <p className="text-xs mt-2 opacity-75">
                          {formatTime(questionSegment.start_time)}
                        </p>
                      )}
                    </div>
                    {questionSegment && (
                      <svg
                        className="flex-shrink-0 w-5 h-5 opacity-75"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* No segments message */}
        {segments.length === 0 && (
          <div className="mt-8 p-6 rounded-xl text-center" style={{ backgroundColor: '#f4f1ea' }}>
            <p className="text-sm" style={{ color: '#737373' }}>
              Transcript segments are being processed. Please check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
