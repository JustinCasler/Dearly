'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AvailabilitySlot } from '@/types/database'

export default function AvailabilityManagement() {
  const router = useRouter()
  const supabase = createClient()

  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    checkAuth()
    fetchSlots()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/availability/list')
      const data = await response.json()

      if (response.ok) {
        setSlots(data.slots || [])
      } else {
        setError('Failed to fetch availability slots')
      }
    } catch (err) {
      setError('An error occurred while fetching slots')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)

    try {
      // Combine date and time
      const start_time = new Date(`${startDate}T${startTime}:00`).toISOString()
      const end_time = new Date(`${startDate}T${endTime}:00`).toISOString()

      const response = await fetch('/api/admin/availability/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start_time, end_time }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Time slot(s) created successfully!')
        setStartDate('')
        setStartTime('')
        setEndTime('')
        fetchSlots()
      } else {
        setError(data.error || 'Failed to create time slot')
      }
    } catch (err) {
      setError('An error occurred while creating the slot')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/availability/delete?id=${slotId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Time slot deleted successfully!')
        fetchSlots()
      } else {
        setError(data.error || 'Failed to delete time slot')
      }
    } catch (err) {
      setError('An error occurred while deleting the slot')
      console.error(err)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    })
  }

  const isPastSlot = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  // Group slots by date
  const groupedSlots = slots.reduce((groups, slot) => {
    const date = new Date(slot.start_time).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(slot)
    return groups
  }, {} as Record<string, AvailabilitySlot[]>)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="mt-2 text-gray-600">Manage interview time slots</p>
        </div>

        {/* Create Slot Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Time Slot</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
              {success}
            </div>
          )}

          <form onSubmit={handleCreateSlot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (EST)
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time (EST)
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Creating...' : 'Create Time Slot'}
            </button>
          </form>
        </div>

        {/* Slots List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available Time Slots</h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-600">No time slots available. Create one above to get started.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{date}</h3>
                  <div className="space-y-2">
                    {dateSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-4 border rounded-md ${
                          isPastSlot(slot.start_time)
                            ? 'bg-gray-50 border-gray-200'
                            : slot.is_booked
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">
                              {new Date(slot.start_time).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                              {' - '}
                              {new Date(slot.end_time).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                isPastSlot(slot.start_time)
                                  ? 'bg-gray-200 text-gray-700'
                                  : slot.is_booked
                                  ? 'bg-blue-200 text-blue-800'
                                  : 'bg-green-200 text-green-800'
                              }`}
                            >
                              {isPastSlot(slot.start_time)
                                ? 'Past'
                                : slot.is_booked
                                ? 'Booked'
                                : 'Available'}
                            </span>
                          </div>
                        </div>

                        {!slot.is_booked && !isPastSlot(slot.start_time) && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
