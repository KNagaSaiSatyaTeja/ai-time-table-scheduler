from datetime import datetime
from typing import List
from model import TimeSlot, Break

def parse_time(time_str: str) -> datetime:
    try:
        return datetime.strptime(time_str, "%I:%M %p")
    except ValueError:
        raise ValueError(f"Invalid time format: {time_str}. Expected format: 'HH:MM AM/PM'")

def check_time_conflict(slot1: TimeSlot, slot2: TimeSlot) -> bool:
    if slot1.day != slot2.day:
        return False
    start1 = parse_time(slot1.startTime)
    end1 = parse_time(slot1.endTime)
    start2 = parse_time(slot2.startTime)
    end2 = parse_time(slot2.endTime)
    return not (end1 <= start2 or end2 <= start1)

def check_break_conflict(time_slot: TimeSlot, breaks: List[Break]) -> bool:
    for br in breaks:
        break_slot = TimeSlot(day=time_slot.day, startTime=br.startTime, endTime=br.endTime)
        if check_time_conflict(time_slot, break_slot):
            return True
    return False