from typing import List, Dict
from model import TimeSlot, ScheduleAssignment, ScheduleInput
from untils import parse_time, check_time_conflict, check_break_conflict

class ConstraintChecker:
    def __init__(self, input_data: ScheduleInput):
        self.input_data = input_data
        self.college_start = parse_time(input_data.college_time.startTime)
        self.college_end = parse_time(input_data.college_time.endTime)
        self.breaks = input_data.break_

    def is_within_college_time(self, slot: TimeSlot) -> bool:
        start = parse_time(slot.startTime)
        end = parse_time(slot.endTime)
        return self.college_start <= start and end <= self.college_end

    def check_constraints(self, schedule: List[ScheduleAssignment]) -> List[str]:
        violations = []
        
        # Track assignments
        faculty_slots: Dict[str, List[TimeSlot]] = {}
        room_slots: Dict[str, List[TimeSlot]] = {}
        group_slots: Dict[str, List[TimeSlot]] = {}
        
        for assignment in schedule:
            slot = TimeSlot(day=assignment.day, startTime=assignment.startTime, endTime=assignment.endTime)
            
            # Check college time
            if not self.is_within_college_time(slot):
                violations.append(f"Assignment {assignment.subject} outside college hours")
            
            # Check break conflict
            if check_break_conflict(slot, self.breaks):
                violations.append(f"Assignment {assignment.subject} during break")
            
            # Faculty conflict
            faculty_slots.setdefault(assignment.faculty_id, []).append(slot)
            for existing_slot in faculty_slots[assignment.faculty_id][:-1]:
                if check_time_conflict(slot, existing_slot):
                    violations.append(f"Faculty {assignment.faculty_id} conflict at {slot.day} {slot.startTime}")
            
            # Room conflict
            room_slots.setdefault(assignment.room_id, []).append(slot)
            for existing_slot in room_slots[assignment.room_id][:-1]:
                if check_time_conflict(slot, existing_slot):
                    violations.append(f"Room {assignment.room_id} conflict at {slot.day} {slot.startTime}")
            
            # Student group conflict
            group_slots.setdefault(assignment.student_group, []).append(slot)
            for existing_slot in group_slots[assignment.student_group][:-1]:
                if check_time_conflict(slot, existing_slot):
                    violations.append(f"Group {assignment.student_group} conflict at {slot.day} {slot.startTime}")
        
        # Check all subjects assigned
        scheduled_subjects = set(a.subject for a in schedule)
        all_subjects = set(s.name for s in self.input_data.subjects)
        missing = all_subjects - scheduled_subjects
        if missing:
            violations.append(f"Missing subjects: {missing}")
        
        return violations

    def calculate_fitness(self, schedule: List[ScheduleAssignment]) -> float:
        # Hard constraint violations
        violations = self.check_constraints(schedule)
        hard_penalty = len(violations) * 1000
        
        # Soft constraint: Faculty preferences
        soft_penalty = 0
        for assignment in schedule:
            for subject in self.input_data.subjects:
                if subject.name == assignment.subject:
                    for faculty in subject.faculty:  # Support multiple faculty per subject
                        if faculty.id == assignment.faculty_id:
                            slot_id = f"{assignment.day}_{assignment.startTime}"
                            if slot_id not in faculty.preferred_slots:
                                soft_penalty += 10
                            break
                    break
        
        return hard_penalty + soft_penalty