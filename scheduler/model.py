from pydantic import BaseModel
from typing import List, Optional

class TimeSlot(BaseModel):
    day: str
    startTime: str
    endTime: str

class Break(BaseModel):
    startTime: str
    endTime: str

class Faculty(BaseModel):
    id: str
    name: str
    availability: List[TimeSlot]
    preferred_slots: List[str]

class Subject(BaseModel):
    name: str
    faculty: List[Faculty]
    student_group: str

class CollegeTime(BaseModel):
    startTime: str
    endTime: str

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