from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

class TimeSlot(BaseModel):
    day: str
    startTime: str
    endTime: str

    @validator('day')
    def validate_day(cls, v):
        valid_days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        if v.upper() not in valid_days:
            raise ValueError(f'Day must be one of {valid_days}')
        return v.upper()

    @validator('startTime', 'endTime')
    def validate_time(cls, v):
        try:
            datetime.strptime(v, "%I:%M %p")
            return v
        except ValueError:
            raise ValueError('Time must be in format "HH:MM AM/PM"')

class Break(BaseModel):
    startTime: str
    endTime: str

    @validator('startTime', 'endTime')
    def validate_time(cls, v):
        try:
            datetime.strptime(v, "%I:%M %p")
            return v
        except ValueError:
            raise ValueError('Time must be in format "HH:MM AM/PM"')

    @validator('endTime')
    def validate_end_time(cls, v, values):
        if 'startTime' in values:
            start = datetime.strptime(values['startTime'], "%I:%M %p")
            end = datetime.strptime(v, "%I:%M %p")
            if end <= start:
                raise ValueError('End time must be after start time')
        return v

class Faculty(BaseModel):
    id: str
    name: str
    availability: List[TimeSlot]
    preferred_slots: Optional[List[str]] = []

class Subject(BaseModel):
    name: str
    faculty: List[Faculty]
    student_group: str

class CollegeTime(BaseModel):
    startTime: str
    endTime: str

    @validator('startTime', 'endTime')
    def validate_time(cls, v):
        try:
            datetime.strptime(v, "%I:%M %p")
            return v
        except ValueError:
            raise ValueError('Time must be in format "HH:MM AM/PM"')

    @validator('endTime')
    def validate_end_time(cls, v, values):
        if 'startTime' in values:
            start = datetime.strptime(values['startTime'], "%I:%M %p")
            end = datetime.strptime(v, "%I:%M %p")
            if end <= start:
                raise ValueError('End time must be after start time')
        return v

class ScheduleInput(BaseModel):
    subjects: List[Subject]
    break_: List[Break]
    college_time: CollegeTime
    rooms: List[str]

class ScheduleAssignment(BaseModel):
    subject: str
    faculty_id: str
    faculty_name: str
    day: str
    startTime: str
    endTime: str
    student_group: str
    room_id: str