import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const handleQuickRange = (days: number) => {    
    const end = new Date().toISOString()
    const start = new Date(new Date().setDate(new Date().getDate() - days)).toISOString()
    onChange(start, end)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onChange(e.target.value, endDate)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onChange(startDate, e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickRange(7)}
        >
          Last 7 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickRange(30)}
        >
          Last 30 Days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickRange(90)}
        >
          Last 90 Days
        </Button>
      </div>
    </div>
  )
}