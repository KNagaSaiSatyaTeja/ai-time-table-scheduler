export interface Timetable {
  _id: string
  department: string
  semester: number
  generation_date: string
  isActive: boolean
  classes: Array<{
    subject: string
    faculty: {
      id: string
      name: string
    }
    day: string
    startTime: string
    endTime: string
    room: string
    duration: number
    isSpecial: boolean
  }>
  timeSlots: string[]
  statistics: {
    fitness: number
    preference_score: number
    break_slots: number
    total_assignments: number
    total_available_slots: number
    utilization_percentage: number
  }
}

export interface TimetableFormData {
  college_time: {
    startTime: string
    endTime: string
  }
  break_: Array<{
    day: string
    startTime: string
    endTime: string
  }>
  rooms: string[]
  subjects: Array<{
    name: string
    duration: number
    time: number
    no_of_classes_per_week: number
    faculty: Array<{
      id: string
      name: string
      availability: Array<{
        day: string
        startTime: string
        endTime: string
      }>
    }>
  }>
  department: string
  semester: number
}