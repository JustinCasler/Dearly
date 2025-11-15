'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns'
import { AvailabilitySlot } from '@/types/database'

interface CalendarBookingProps {
  availableSlots: AvailabilitySlot[]
  onSelectSlot: (slotId: string) => void
  selectedSlotId: string | null
}

export default function CalendarBooking({
  availableSlots,
  onSelectSlot,
  selectedSlotId,
}: CalendarBookingProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  // Convert availability slots to calendar slots
  const calendarSlots = useMemo(() => {
    return availableSlots.map((slot) => ({
      id: slot.id,
      start: parseISO(slot.start_time),
      end: parseISO(slot.end_time),
      isBooked: slot.is_booked,
    }))
  }, [availableSlots])

  // Get calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentDate])

  // Get slots for a specific day
  const getSlotsForDay = (day: Date) => {
    return calendarSlots.filter((slot) =>
      isSameDay(slot.start, day)
    )
  }

  // Check if a day has available slots
  const hasAvailableSlots = (day: Date) => {
    return getSlotsForDay(day).some((slot) => !slot.isBooked)
  }

  const handlePrevious = () => {
    setCurrentDate(addMonths(currentDate, -1))
    setSelectedDay(null)
  }

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1))
    setSelectedDay(null)
  }

  const handleDayClick = (day: Date) => {
    if (hasAvailableSlots(day)) {
      setSelectedDay(day)
    }
  }

  const daySlots = selectedDay ? getSlotsForDay(selectedDay) : []

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Calendar Section */}
        <div className="w-full">
          {/* Month Header */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{ color: '#1A0089' }}
              aria-label="Previous month"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold font-serif min-w-[200px] text-center" style={{ color: '#1A0089' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={handleNext}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{ color: '#1A0089' }}
              aria-label="Next month"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="text-center text-xs font-bold py-1.5 opacity-60" style={{ color: '#1A0089' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day: Date, i: number) => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())
              const hasSlots = hasAvailableSlots(day)
              const isSelected = selectedDay && isSameDay(day, selectedDay)

              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasSlots}
                  className={`
                    aspect-square p-1.5 rounded-lg text-sm font-semibold transition-all duration-200 relative
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${!hasSlots && isCurrentMonth ? 'opacity-40 cursor-not-allowed' : ''}
                    ${hasSlots && !isToday && !isSelected ? 'hover:scale-105 cursor-pointer' : ''}
                  `}
                  style={{
                    color: isToday || isSelected ? '#FFFFFF' : hasSlots ? '#1A0089' : '#1A0089',
                    backgroundColor: isToday ? '#1A0089' : isSelected ? '#B7CF3F' : hasSlots ? 'rgba(183, 207, 63, 0.1)' : 'transparent'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-xs md:text-sm">{format(day, 'd')}</span>
                    {hasSlots && !isToday && !isSelected && isCurrentMonth && (
                      <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#B7CF3F' }}></div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots Section */}
        <div className="md:border-l-2 md:pl-6 border-t-2 md:border-t-0 pt-6 md:pt-0 overflow-x-hidden" style={{ borderColor: 'rgba(26, 0, 137, 0.1)' }}>
          {selectedDay ? (
            <>
              <h3 className="text-lg font-bold font-serif mb-4" style={{ color: '#1A0089' }}>
                {format(selectedDay, 'EEEE, MMMM d')}
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto overflow-x-hidden pr-2">
                {daySlots
                  .filter(slot => !slot.isBooked)
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map((slot: any) => (
                    <button
                      key={slot.id}
                      onClick={() => onSelectSlot(slot.id)}
                      className={`
                        w-full px-4 py-3 text-center text-base rounded-xl border-2 transition-all duration-200 font-semibold
                        ${selectedSlotId === slot.id
                          ? 'shadow-md'
                          : 'hover:shadow-sm'
                        }
                      `}
                      style={{
                        borderColor: selectedSlotId === slot.id ? '#1A0089' : 'rgba(26, 0, 137, 0.2)',
                        backgroundColor: selectedSlotId === slot.id ? '#1A0089' : '#FEFEFE',
                        color: selectedSlotId === slot.id ? '#FFFFFF' : '#1A0089'
                      }}
                    >
                      {format(slot.start, 'h:mm a')}
                    </button>
                  ))}
                {daySlots.filter(slot => !slot.isBooked).length === 0 && (
                  <p className="text-sm text-center py-8 opacity-60" style={{ color: '#1A0089' }}>
                    No available time slots for this day
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-center opacity-60" style={{ color: '#1A0089' }}>
              <p>Select a date to see available times</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
