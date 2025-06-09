# utils.py
from datetime import datetime
from typing import List, Tuple
from model import TimeSlot, Break

# Define valid days for scheduling
VALID_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

def time_to_minutes(time_str: str) -> int:
    """Convert time string (e.g., '09:30 AM' or '13:30') to minutes since midnight."""
    try:
        dt = datetime.strptime(time_str, "%I:%M %p")
        return dt.hour * 60 + dt.minute
    except ValueError:
        try:
            dt = datetime.strptime(time_str, "%H:%M")
            return dt.hour * 60 + dt.minute
        except ValueError:
            if time_str.endswith(" AM") or time_str.endswith(" PM"):
                try:
                    clean_time = time_str[:-3].strip()
                    dt = datetime.strptime(clean_time, "%H:%M")
                    hours, minutes = dt.hour, dt.minute
                    if time_str.endswith(" PM") and hours < 12:
                        hours += 12
                    elif time_str.endswith(" AM") and hours == 12:
                        hours = 0
                    elif hours > 23:
                        raise ValueError(f"Invalid hour: {hours}")
                    return hours * 60 + minutes
                except ValueError as e:
                    print(f"[ERROR] Invalid time format: {time_str}, error: {e}")
                    raise ValueError(f"Invalid time format: {time_str}")
            print(f"[ERROR] Invalid time format: {time_str}")
            raise ValueError(f"Invalid time format: {time_str}")

def minutes_to_time(minutes: int) -> str:
    """Convert minutes since midnight to 12-hour time string (e.g., '01:30 PM')."""
    hours, mins = divmod(minutes, 60)
    period = "AM" if hours < 12 else "PM"
    if hours == 0:
        hours = 12
    elif hours >= 12:
        hours = hours - 12 if hours > 12 else 12
    time_str = f"{hours:02d}:{mins:02d} {period}"
    try:
        time_to_minutes(time_str)
        return time_str
    except ValueError as e:
        print(f"[ERROR] Generated invalid time: {time_str}, error: {e}")
        raise ValueError(f"Generated invalid time: {time_str}")

def check_time_conflict(slot1: TimeSlot, slot2: TimeSlot) -> bool:
    """Check if two time slots conflict on the same day."""
    if slot1.day != slot2.day:
        return False
    try:
        start1 = time_to_minutes(slot1.startTime)
        end1 = time_to_minutes(slot1.endTime)
        start2 = time_to_minutes(slot2.startTime)
        end2 = time_to_minutes(slot2.endTime)
        conflict = not (end1 <= start2 or end2 <= start1)
        if conflict:
            print(f"[DEBUG] Time conflict between {slot1.day} {slot1.startTime}-{slot1.endTime} and {slot2.day} {slot2.startTime}-{slot2.endTime}")
        return conflict
    except ValueError as e:
        print(f"[ERROR] Time conflict check failed: {e}")
        return True

def check_break_conflict(slot: TimeSlot, breaks: List[Break]) -> bool:
    """Check if a time slot conflicts with any break, including ALL_DAYS breaks."""
    if slot.day not in VALID_DAYS:
        print(f"[ERROR] Invalid day in slot: {slot.day}")
        return True
    for b in breaks:
        if b.day == "ALL_DAYS" or b.day == slot.day:
            break_slot = TimeSlot(day=slot.day, startTime=b.startTime, endTime=b.endTime)
            if check_time_conflict(slot, break_slot):
                print(f"[DEBUG] Slot {slot.day} {slot.startTime}-{slot.endTime} conflicts with break {b.day} {b.startTime}-{b.endTime}")
                return True
    return False

def generate_time_slots(start_time: str, end_time: str, duration: int, day: str, breaks: List[Break]) -> List[TimeSlot]:
    """Generate all possible time slots of given duration, avoiding breaks including ALL_DAYS."""
    if day not in VALID_DAYS:
        print(f"[ERROR] Invalid day: {day}")
        return []
    slots = []
    try:
        start_minutes = time_to_minutes(start_time)
        end_minutes = time_to_minutes(end_time)
        if start_minutes >= end_minutes:
            print(f"[ERROR] Invalid time range: {start_time} >= {end_time}")
            return slots
    except ValueError as e:
        print(f"[ERROR] Failed to parse times in generate_time_slots: {start_time}, {end_time}, error: {e}")
        return slots

    current = start_minutes
    while current + duration <= end_minutes:
        slot_end = current + duration
        try:
            slot = TimeSlot(
                day=day,
                startTime=minutes_to_time(current),
                endTime=minutes_to_time(slot_end)
            )
            if not check_break_conflict(slot, breaks):
                slots.append(slot)
                print(f"[DEBUG] Valid slot: {day} {slot.startTime}-{slot.endTime}")
            else:
                print(f"[DEBUG] Skipped slot due to break conflict: {day} {slot.startTime}-{slot.endTime}")
        except ValueError as e:
            print(f"[ERROR] Failed to generate slot for {day} {current}–{slot_end} minutes, error: {e}")
        current += duration  # Move to the next slot with no gaps
    print(f"[DEBUG] Generated {len(slots)} slots for {day} {start_time}-{end_time}: {[f'{s.startTime}-{s.endTime}' for s in slots]}")
    return slots

def generate_weekly_time_slots(start_time: str, end_time: str, breaks: List[Break], subjects: List) -> Tuple[List[str], List[TimeSlot]]:
    """
    Generate time slots for all days, covering the entire college time with subject durations.
    Returns: (time_slot_labels, all_slots)
    """
    try:
        start_minutes = time_to_minutes(start_time)
        end_minutes = time_to_minutes(end_time)
        if start_minutes >= end_minutes:
            print(f"[ERROR] Invalid college time range: {start_time} >= {end_time}")
            return [], []
    except ValueError as e:
        print(f"[ERROR] Failed to parse college times: {start_time}, {end_time}, error: {e}")
        return [], []

    # Get unique durations from subjects
    durations = sorted(set(subject.duration for subject in subjects))  # e.g., [50, 100]

    time_slot_labels = set()
    all_slots = []
    for day in VALID_DAYS:
        current = start_minutes
        day_slots = []
        while current < end_minutes:
            # Find a duration that fits the remaining time
            remaining_time = end_minutes - current
            possible_durations = [d for d in durations if d <= remaining_time]
            if not possible_durations:
                break  # No duration fits, stop here
            duration = random.choice(possible_durations)  # Randomly pick a duration that fits
            slot_end = current + duration
            try:
                slot = TimeSlot(
                    day=day,
                    startTime=minutes_to_time(current),
                    endTime=minutes_to_time(slot_end)
                )
                if not check_break_conflict(slot, breaks):
                    day_slots.append(slot)
                    slot_label = f"{slot.startTime}-{slot.endTime}"
                    time_slot_labels.add(slot_label)
                else:
                    print(f"[DEBUG] Skipped slot due to break conflict: {day} {slot.startTime}-{slot.endTime}")
            except ValueError as e:
                print(f"[ERROR] Failed to generate slot for {day} {current}–{slot_end} minutes, error: {e}")
            current += duration  # Move to the next slot with no gaps

        # Check if the day is fully covered; if not, adjust the last slot to end at end_time
        if day_slots and time_to_minutes(day_slots[-1].endTime) < end_minutes:
            last_slot = day_slots[-1]
            remaining_time = end_minutes - time_to_minutes(last_slot.startTime)
            if remaining_time in durations:
                last_slot.endTime = minutes_to_time(end_minutes)
                slot_label = f"{last_slot.startTime}-{last_slot.endTime}"
                time_slot_labels.add(slot_label)
            else:
                day_slots.pop()  # Remove the last slot if it can't be adjusted
        all_slots.extend(day_slots)

    time_slot_labels = sorted(list(time_slot_labels), key=lambda x: time_to_minutes(x.split("-")[0]))
    print(f"[DEBUG] Generated {len(time_slot_labels)} weekly time slots: {time_slot_labels}")
    return time_slot_labels, all_slots