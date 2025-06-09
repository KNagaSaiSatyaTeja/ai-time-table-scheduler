from typing import List, Tuple
from model import TimeSlot, Break
import re

# Valid days of the week
VALID_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

def time_to_minutes(time_str: str) -> int:
    """Convert time string (HH:MM or HH:MM AM/PM) to minutes since midnight."""
    # Handle AM/PM format
    if 'AM' in time_str.upper() or 'PM' in time_str.upper():
        time_str = time_str.upper().strip()
        is_pm = 'PM' in time_str
        time_part = time_str.replace('AM', '').replace('PM', '').strip()
        
        if not re.match(r'^\d{1,2}:\d{2}$', time_part):
            raise ValueError(f"Invalid time format: {time_str}. Expected format: HH:MM AM/PM")
        
        hours, minutes = map(int, time_part.split(':'))
        
        # Convert to 24-hour format
        if is_pm and hours != 12:
            hours += 12
        elif not is_pm and hours == 12:
            hours = 0
            
        if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
            raise ValueError(f"Invalid time values in {time_str}")
        
        return hours * 60 + minutes
    
    # Handle 24-hour format
    if not re.match(r'^\d{1,2}:\d{2}$', time_str):
        raise ValueError(f"Invalid time format: {time_str}. Expected format: HH:MM or HH:MM AM/PM")
    
    hours, minutes = map(int, time_str.split(':'))
    if hours < 0 or hours > 23 or minutes < 0 or minutes > 59:
        raise ValueError(f"Invalid time values in {time_str}. Hours must be 0-23, minutes 0-59")
    
    return hours * 60 + minutes

def minutes_to_time(minutes: int) -> str:
    """Convert minutes since midnight to time string (HH:MM)."""
    if minutes < 0 or minutes > 1439:  # 23:59 = 1439 minutes
        raise ValueError(f"Invalid minutes value: {minutes}. Must be between 0 and 1439")
    
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

def check_time_conflict(slot1: TimeSlot, slot2: TimeSlot) -> bool:
    """Check if two time slots conflict with each other."""
    if slot1.day != slot2.day:
        return False
    
    start1 = time_to_minutes(slot1.startTime)
    end1 = time_to_minutes(slot1.endTime)
    start2 = time_to_minutes(slot2.startTime)
    end2 = time_to_minutes(slot2.endTime)
    
    # Check if one slot starts during the other slot
    return (start1 < end2 and start2 < end1)

def check_break_conflict(slot: TimeSlot, breaks: List[Break]) -> bool:
    """Check if a time slot conflicts with any break."""
    for break_slot in breaks:
        # Handle ALL_DAYS break
        if break_slot.day == "ALL_DAYS" or break_slot.day == slot.day:
            break_start = time_to_minutes(break_slot.startTime)
            break_end = time_to_minutes(break_slot.endTime)
            slot_start = time_to_minutes(slot.startTime)
            slot_end = time_to_minutes(slot.endTime)
            
            # Check if the slot overlaps with the break
            if slot_start < break_end and break_start < slot_end:
                return True
    
    return False

def generate_time_slots(start_time: str, end_time: str, breaks: List[Break], subjects: List) -> List[str]:
    """Generate time slot labels based on college time and subject durations."""
    start_minutes = time_to_minutes(start_time)
    end_minutes = time_to_minutes(end_time)
    
    # Get unique subject durations
    durations = set(subject.time for subject in subjects)
    if not durations:
        return []
    
    # Generate all possible time slots
    time_slots = []
    current_time = start_minutes
    
    while current_time + min(durations) <= end_minutes:
        for duration in sorted(durations):
            if current_time + duration <= end_minutes:
                slot_start = minutes_to_time(current_time)
                slot_end = minutes_to_time(current_time + duration)
                time_slots.append(f"{slot_start}-{slot_end}")
        
        # Move to the next potential start time
        current_time += min(durations)
    
    return sorted(set(time_slots), key=lambda x: time_to_minutes(x.split('-')[0]))

def generate_weekly_time_slots(start_time: str, end_time: str, breaks: List[Break], subjects: List) -> Tuple[List[str], List[TimeSlot]]:
    """Generate time slots for all days of the week."""
    time_slot_labels = generate_time_slots(start_time, end_time, breaks, subjects)
    
    # Create TimeSlot objects for each day and time slot
    fixed_slots = []
    for day in VALID_DAYS:
        for slot_label in time_slot_labels:
            start, end = slot_label.split('-')
            slot = TimeSlot(day=day, startTime=start, endTime=end)
            
            # Skip slots that conflict with breaks
            if not check_break_conflict(slot, breaks):
                fixed_slots.append(slot)
    
    return time_slot_labels, fixed_slots
