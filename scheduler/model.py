# model.py
from dataclasses import dataclass
from typing import List

@dataclass
class TimeSlot:
    day: str  # e.g., "MONDAY", "TUESDAY", ..., "SATURDAY"
    startTime: str  # e.g., "09:30" (24-hour format)
    endTime: str  # e.g., "10:20" (24-hour format)

@dataclass
class Break:
    day: str  # "MONDAY", "TUESDAY", ..., "SATURDAY", or "ALL_DAYS" for all weekdays
    startTime: str  # e.g., "11:10" (24-hour format)
    endTime: str  # e.g., "11:20" (24-hour format)

@dataclass
class Faculty:
    id: str
    name: str
    availability: List[TimeSlot]

@dataclass
class Subject:
    name: str
    duration: int  # Deprecated, mapped to time for backward compatibility
    time: int  # Duration in minutes (e.g., 50)
    no_of_classes_per_week: int  # Number of classes required per week
    faculty: List[Faculty]

    def __post_init__(self):
        if not hasattr(self, 'time') or self.time is None:
            self.time = self.duration
        if not hasattr(self, 'no_of_classes_per_week'):
            self.no_of_classes_per_week = 1

@dataclass
class CollegeTime:
    startTime: str  # e.g., "09:30" (24-hour format)
    endTime: str  # e.g., "14:50" (24-hour format)

@dataclass
class ScheduleAssignment:
    subject_name: str
    faculty_id: str
    faculty_name: str  # Added for frontend display
    day: str
    startTime: str
    endTime: str
    room_id: str

    def model_dump(self):
        # Updated to return all fields for compatibility with SchedulerService
        return {
            "subject_name": self.subject_name,
            "faculty_id": self.faculty_id,
            "faculty_name": self.faculty_name,
            "day": self.day,
            "startTime": self.startTime,
            "endTime": self.endTime,
            "room_id": self.room_id
        }

@dataclass
class ScheduleInput:
    subjects: List[Subject]
    break_: List[Break]
    college_time: CollegeTime
    rooms: List[str]