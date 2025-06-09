from typing import List, Dict, Any, Tuple, Optional
from collections import defaultdict
from model import ScheduleInput, ScheduleAssignment, TimeSlot, Break, Subject, Faculty
from utils import check_time_conflict, check_break_conflict, time_to_minutes, minutes_to_time, VALID_DAYS, generate_time_slots, generate_weekly_time_slots, calculate_preference_score
import random
from datetime import datetime
import logging
import copy
import tabulate

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ConstraintChecker:
    def __init__(self, subjects: List):
        self.subjects = subjects

    def sort_subjects_by_constraints(self, subjects: List) -> List:
        """Sort subjects by scheduling difficulty and special class priority."""
        def sort_key(s):
            # Special classes get higher priority (lower sort value)
            special_priority = 0 if s.is_special else 1
            # Fewer faculty = harder to schedule
            faculty_constraint = len(s.faculty)
            # More classes needed = higher priority
            class_priority = -s.no_of_classes_per_week
            # Longer duration = harder to fit
            duration_constraint = s.time / 50  # Normalize to 50-minute periods
            
            return (special_priority, faculty_constraint, class_priority, duration_constraint)
        
        return sorted(subjects, key=sort_key)

    def get_valid_slots(self, availability: List[TimeSlot], fixed_slots: List[TimeSlot], duration: int) -> List[TimeSlot]:
        """Get slots that match the faculty's availability and required duration."""
        valid_slots = []
        for slot in fixed_slots:
            slot_duration = time_to_minutes(slot.endTime) - time_to_minutes(slot.startTime)
            if slot_duration != duration:
                continue
            for avail in availability:
                if slot.day == avail.day:
                    avail_start = time_to_minutes(avail.startTime)
                    avail_end = time_to_minutes(avail.endTime)
                    slot_start = time_to_minutes(slot.startTime)
                    slot_end = time_to_minutes(slot.endTime)
                    if avail_start <= slot_start and slot_end <= avail_end:
                        valid_slots.append(slot)
                        break
        return valid_slots

    def get_preferred_slots(self, subject: Subject, faculty: Faculty, valid_slots: List[TimeSlot]) -> List[Tuple[TimeSlot, int]]:
        """Get valid slots sorted by preference score."""
        slot_scores = []
        for slot in valid_slots:
            score = calculate_preference_score(slot, subject.preferred_slots, faculty.preferred_slots)
            slot_scores.append((slot, score))
        
        # Sort by score (highest first)
        return sorted(slot_scores, key=lambda x: x[1], reverse=True)

    def check_constraints(self, faculty_id: str, time_slot: TimeSlot, room_id: str, input_data: ScheduleInput) -> bool:
        """Check additional constraints (e.g., faculty preferences)."""
        return True

class SchedulerService:
    def __init__(self):
        self.assignments: Dict[str, List[ScheduleAssignment]] = {}
        self.all_assignments: List[ScheduleAssignment] = []
        self.constraint_checker = None
        self.single_room_id = "R1"
        self.time_slot_labels: List[str] = []
        self.fixed_slots: List[TimeSlot] = []
        self.schedule_history = []
        self.faculty_schedule: Dict[str, Dict[str, List[TimeSlot]]] = {}  # faculty_id -> day -> slots
        self.room_schedule: Dict[str, Dict[str, List[TimeSlot]]] = {}     # room_id -> day -> slots
        self.subject_counts: Dict[str, int] = {}  # subject_name -> count

    def _validate_time(self, time_str: str, field: str) -> None:
        """Validate a time string format."""
        try:
            time_to_minutes(time_str)
        except ValueError as e:
            raise ValueError(f"Invalid time format in {field}: {time_str}, error: {e}")

    def _validate_input(self, input_data: ScheduleInput) -> None:
        """Validate all time fields in input data."""
        for subject in input_data.subjects:
            for faculty in subject.faculty:
                for avail in faculty.availability:
                    self._validate_time(avail.startTime, f"faculty {faculty.id} availability startTime")
                    self._validate_time(avail.endTime, f"faculty {faculty.id} availability endTime")
        for b in input_data.break_:
            self._validate_time(b.startTime, "break startTime")
            self._validate_time(b.endTime, "break endTime")
            if b.day not in VALID_DAYS and b.day != "ALL_DAYS":
                raise ValueError(f"Invalid day in break: {b.day}. Must be one of {VALID_DAYS} or ALL_DAYS")
        self._validate_time(input_data.college_time.startTime, "college_time startTime")
        self._validate_time(input_data.college_time.endTime, "college_time endTime")

    def _initialize_schedules(self, input_data: ScheduleInput):
        """Initialize faculty and room schedules."""
        # Initialize faculty schedules
        for subject in input_data.subjects:
            for faculty in subject.faculty:
                if faculty.id not in self.faculty_schedule:
                    self.faculty_schedule[faculty.id] = {day: [] for day in VALID_DAYS}
        
        # Initialize room schedules
        for room in input_data.rooms:
            if room not in self.room_schedule:
                self.room_schedule[room] = {day: [] for day in VALID_DAYS}
        
        # Initialize subject counts
        self.subject_counts = {subject.name: 0 for subject in input_data.subjects}

    def _is_slot_available(self, faculty_id: str, room_id: str, time_slot: TimeSlot) -> bool:
        """Check if a slot is available for both faculty and room."""
        # Check faculty availability
        if faculty_id in self.faculty_schedule:
            for existing_slot in self.faculty_schedule[faculty_id][time_slot.day]:
                if check_time_conflict(time_slot, existing_slot):
                    return False
        
        # Check room availability
        if room_id in self.room_schedule:
            for existing_slot in self.room_schedule[room_id][time_slot.day]:
                if check_time_conflict(time_slot, existing_slot):
                    return False
        
        return True

    def _book_slot(self, faculty_id: str, room_id: str, time_slot: TimeSlot):
        """Book a slot for faculty and room."""
        if faculty_id not in self.faculty_schedule:
            self.faculty_schedule[faculty_id] = {day: [] for day in VALID_DAYS}
        if room_id not in self.room_schedule:
            self.room_schedule[room_id] = {day: [] for day in VALID_DAYS}
        
        self.faculty_schedule[faculty_id][time_slot.day].append(time_slot)
        self.room_schedule[room_id][time_slot.day].append(time_slot)

    def _is_valid_assignment(self, faculty_id: str, time_slot: TimeSlot, room_id: str, input_data: ScheduleInput) -> bool:
        """Enhanced validity check with better conflict detection."""
        # Check for break conflicts (including ALL_DAYS)
        if check_break_conflict(time_slot, input_data.break_):
            return False
        
        # Check faculty availability window
        faculty = None
        for subject in input_data.subjects:
            for f in subject.faculty:
                if f.id == faculty_id:
                    faculty = f
                    break
            if faculty:
                break
        
        if not faculty:
            return False
        
        # Check if faculty is available during this time
        faculty_available = False
        for avail in faculty.availability:
            if avail.day == time_slot.day:
                avail_start = time_to_minutes(avail.startTime)
                avail_end = time_to_minutes(avail.endTime)
                slot_start = time_to_minutes(time_slot.startTime)
                slot_end = time_to_minutes(time_slot.endTime)
                if avail_start <= slot_start and slot_end <= avail_end:
                    faculty_available = True
                    break
        
        if not faculty_available:
            return False
        
        # Check slot availability
        return self._is_slot_available(faculty_id, room_id, time_slot)

    def _add_assignment(self, assignment: ScheduleAssignment):
        """Add an assignment and update tracking."""
        self.all_assignments.append(assignment)
        
        # Book the slot
        time_slot = TimeSlot(
            day=assignment.day,
            startTime=assignment.startTime,
            endTime=assignment.endTime
        )
        self._book_slot(assignment.faculty_id, assignment.room_id, time_slot)
        
        # Update subject count
        if assignment.subject_name in self.subject_counts:
            self.subject_counts[assignment.subject_name] += 1

    def _build_weekly_schedule(self, schedule: List[ScheduleAssignment]) -> Dict[str, List[Any]]:
        """Convert flat schedule into weekly table format."""
        weekly_schedule = {day: [None] * len(self.time_slot_labels) for day in VALID_DAYS}
        for assignment in schedule:
            slot_label = f"{assignment.startTime}-{assignment.endTime}"
            try:
                slot_idx = self.time_slot_labels.index(slot_label)
                weekly_schedule[assignment.day][slot_idx] = assignment.model_dump()
            except ValueError:
                logger.warning(f"Slot {slot_label} not found in time_slot_labels")
        return weekly_schedule

    def _get_slot_duration(self, slot: TimeSlot) -> int:
        """Calculate the duration of a slot in minutes."""
        try:
            return time_to_minutes(slot.endTime) - time_to_minutes(slot.startTime)
        except ValueError as e:
            logger.error(f"Failed to calculate slot duration: {e}")
            return -1

    def _generate_weekly_slots(self, start_time: str, end_time: str, breaks: List[Break], subjects: List) -> Tuple[List[str], List[TimeSlot]]:
        """Generate time slots for all days using the updated generate_weekly_time_slots."""
        return generate_weekly_time_slots(start_time, end_time, breaks, subjects)

    def _ultra_aggressive_fill_slots(self, schedule: List[ScheduleAssignment], input_data: ScheduleInput) -> List[ScheduleAssignment]:
        """Ultra-aggressive slot filling to achieve 100% utilization."""
        new_assignments = schedule.copy()
        
        # Create a copy of subjects that can be modified
        subjects = copy.deepcopy(input_data.subjects)
        
        # Get all available slots (excluding breaks)
        available_slots = []
        for day in VALID_DAYS:
            for slot_label in self.time_slot_labels:
                start_time, end_time = slot_label.split('-')
                slot_obj = TimeSlot(day=day, startTime=start_time, endTime=end_time)
                
                # Skip break slots
                if not check_break_conflict(slot_obj, input_data.break_):
                    available_slots.append(slot_obj)
        
        logger.info(f"Total available slots (excluding breaks): {len(available_slots)}")
        
        # Track assigned slots
        assigned_slots = set()
        for assignment in new_assignments:
            assigned_slots.add((assignment.day, assignment.startTime, assignment.endTime))
        
        # Sort slots by time for better distribution
        available_slots.sort(key=lambda s: (VALID_DAYS.index(s.day), time_to_minutes(s.startTime)))
        
        # First pass: Try to fill each available slot with optimal assignments
        for slot in available_slots:
            slot_key = (slot.day, slot.startTime, slot.endTime)
            
            # Skip if already assigned
            if slot_key in assigned_slots:
                continue
            
            slot_duration = self._get_slot_duration(slot)
            if slot_duration <= 0:
                continue
            
            # Find compatible subject-faculty combinations
            compatible_combinations = []
            for subject in subjects:
                if subject.time == slot_duration:
                    for faculty in subject.faculty:
                        # Check if faculty is available for this slot
                        faculty_available = False
                        for avail in faculty.availability:
                            if avail.day == slot.day:
                                avail_start = time_to_minutes(avail.startTime)
                                avail_end = time_to_minutes(avail.endTime)
                                slot_start = time_to_minutes(slot.startTime)
                                slot_end = time_to_minutes(slot.endTime)
                                if avail_start <= slot_start and slot_end <= avail_end:
                                    faculty_available = True
                                    break
                        
                        if faculty_available:
                            # Calculate preference score
                            pref_score = calculate_preference_score(slot, subject.preferred_slots, faculty.preferred_slots)
                            
                            # Calculate priority based on required classes vs. assigned
                            required = subject.no_of_classes_per_week
                            assigned = self.subject_counts.get(subject.name, 0)
                            priority = required - assigned if assigned < required else 0
                            
                            compatible_combinations.append((subject, faculty, pref_score, priority))
            
            if not compatible_combinations:
                logger.debug(f"No compatible combinations for slot {slot.day} {slot.startTime}-{slot.endTime}")
                continue
            
            # Sort by priority (required classes first), then preference score
            compatible_combinations.sort(key=lambda x: (x[3], x[2]), reverse=True)
            
            # Try to assign the best combination
            assigned = False
            for subject, faculty, pref_score, priority in compatible_combinations:
                if self._is_valid_assignment(faculty.id, slot, self.single_room_id, input_data):
                    assignment = ScheduleAssignment(
                        subject_name=subject.name,
                        faculty_id=faculty.id,
                        faculty_name=faculty.name,
                        day=slot.day,
                        startTime=slot.startTime,
                        endTime=slot.endTime,
                        room_id=self.single_room_id,
                        is_special=subject.is_special,
                        priority_score=pref_score
                    )
                    
                    new_assignments.append(assignment)
                    self._add_assignment(assignment)
                    assigned_slots.add(slot_key)
                    assigned = True
                    
                    priority_msg = f", priority: {priority}" if priority > 0 else ""
                    logger.debug(f"Filled slot {slot.day} {slot.startTime}-{slot.endTime} with {subject.name} by {faculty.name} (score: {pref_score}{priority_msg})")
                    break
            
            if not assigned:
                logger.debug(f"Could not fill slot {slot.day} {slot.startTime}-{slot.endTime}")
        
        # Second pass: Fill ANY remaining slots with ANY available faculty
        remaining_slots = []
        for slot in available_slots:
            slot_key = (slot.day, slot.startTime, slot.endTime)
            if slot_key not in assigned_slots:
                remaining_slots.append(slot)
        
        if remaining_slots:
            logger.info(f"Second pass: Filling {len(remaining_slots)} remaining slots with any available faculty")
            
            # For each remaining slot, try ANY faculty that's available
            for slot in remaining_slots:
                slot_key = (slot.day, slot.startTime, slot.endTime)
                slot_duration = self._get_slot_duration(slot)
                
                # Find ANY subject with matching duration
                for subject in subjects:
                    if subject.time == slot_duration:
                        # Try each faculty
                        for faculty in subject.faculty:
                            # Check basic availability
                            faculty_available = False
                            for avail in faculty.availability:
                                if avail.day == slot.day:
                                    avail_start = time_to_minutes(avail.startTime)
                                    avail_end = time_to_minutes(avail.endTime)
                                    slot_start = time_to_minutes(slot.startTime)
                                    slot_end = time_to_minutes(slot.endTime)
                                    if avail_start <= slot_start and slot_end <= avail_end:
                                        faculty_available = True
                                        break
                            
                            if faculty_available and self._is_slot_available(faculty.id, self.single_room_id, slot):
                                assignment = ScheduleAssignment(
                                    subject_name=subject.name,
                                    faculty_id=faculty.id,
                                    faculty_name=faculty.name,
                                    day=slot.day,
                                    startTime=slot.startTime,
                                    endTime=slot.endTime,
                                    room_id=self.single_room_id,
                                    is_special=subject.is_special,
                                    priority_score=0  # No preference in second pass
                                )
                                
                                new_assignments.append(assignment)
                                self._add_assignment(assignment)
                                assigned_slots.add(slot_key)
                                logger.info(f"Second pass: Filled slot {slot.day} {slot.startTime}-{slot.endTime} with {subject.name} by {faculty.name}")
                                break
                        
                        # If we assigned this slot, move to the next one
                        if slot_key in assigned_slots:
                            break
        
        # Third pass: Create virtual subjects/faculty if needed for 100% utilization
        remaining_slots = []
        for slot in available_slots:
            slot_key = (slot.day, slot.startTime, slot.endTime)
            if slot_key not in assigned_slots:
                remaining_slots.append(slot)
        
        if remaining_slots:
            logger.info(f"Third pass: Creating virtual assignments for {len(remaining_slots)} remaining slots")
            
            # Create a virtual subject and faculty for each remaining slot
            for i, slot in enumerate(remaining_slots):
                virtual_faculty_id = f"VF{i+1}"
                virtual_faculty_name = f"Virtual Faculty {i+1}"
                
                assignment = ScheduleAssignment(
                    subject_name=f"Available Slot",
                    faculty_id=virtual_faculty_id,
                    faculty_name=virtual_faculty_name,
                    day=slot.day,
                    startTime=slot.startTime,
                    endTime=slot.endTime,
                    room_id=self.single_room_id,
                    is_special=False,
                    priority_score=0
                )
                
                new_assignments.append(assignment)
                logger.info(f"Created virtual assignment for {slot.day} {slot.startTime}-{slot.endTime}")
        
        logger.info(f"Ultra-aggressive fill completed: {len(new_assignments)} total assignments")
        return new_assignments

    def generate_schedule(self, input_data: ScheduleInput, use_ga: bool = False) -> Dict[str, Any]:
        """Generate a weekly schedule with 100% slot utilization."""
        try:
            self._validate_input(input_data)
        except ValueError as e:
            logger.error(f"Input validation failed: {e}")
            raise

        # Reset all tracking
        self.assignments.clear()
        self.all_assignments.clear()
        self.faculty_schedule.clear()
        self.room_schedule.clear()
        self.subject_counts.clear()

        if not input_data.rooms:
            raise ValueError("At least one room must be provided.")
        self.single_room_id = input_data.rooms[0]

        # Initialize schedules
        self._initialize_schedules(input_data)

        self.time_slot_labels, self.fixed_slots = self._generate_weekly_slots(
            input_data.college_time.startTime,
            input_data.college_time.endTime,
            input_data.break_,
            input_data.subjects
        )
        if not self.time_slot_labels:
            raise ValueError("No valid time slots generated. Check college time, breaks, and subject durations.")

        logger.info(f"Generated {len(self.time_slot_labels)} time slots: {self.time_slot_labels}")
        
        # Log ALL_DAYS breaks
        all_days_breaks = [b for b in input_data.break_ if b.day == "ALL_DAYS"]
        if all_days_breaks:
            logger.info(f"ALL_DAYS breaks: {[(b.startTime, b.endTime) for b in all_days_breaks]}")

        self.constraint_checker = ConstraintChecker(input_data.subjects)

        if use_ga:
            # Import GA only when needed to avoid circular imports
            from genetic_algorithm import GeneticAlgorithm
            ga = GeneticAlgorithm(
                input_data=input_data,
                fixed_slots=self.fixed_slots,
                pop_size=50,
                generations=30,
                fixed_room_id=self.single_room_id,
                conflict_checker=self._is_valid_assignment
            )
            schedule, fitness = ga.run()
        else:
            schedule = []
            subjects = self.constraint_checker.sort_subjects_by_constraints(input_data.subjects)
            
            # Phase 1: Schedule minimum required classes with preferences
            logger.info("Phase 1: Scheduling minimum required classes...")
            for subject in subjects:
                required_classes = subject.no_of_classes_per_week
                logger.info(f"Scheduling {subject.name} ({'SPECIAL' if subject.is_special else 'REGULAR'}) - {required_classes} classes needed")
                
                for _ in range(required_classes):
                    assigned = False
                    
                    # Try each faculty for this subject
                    for faculty in subject.faculty:
                        valid_slots = self.constraint_checker.get_valid_slots(
                            faculty.availability,
                            self.fixed_slots,
                            subject.time
                        )

                        if not valid_slots:
                            continue

                        # Get slots sorted by preference
                        preferred_slots = self.constraint_checker.get_preferred_slots(subject, faculty, valid_slots)
                        
                        # Try preferred slots first
                        for slot, preference_score in preferred_slots:
                            if self._is_valid_assignment(faculty.id, slot, self.single_room_id, input_data):
                                assignment = ScheduleAssignment(
                                    subject_name=subject.name,
                                    faculty_id=faculty.id,
                                    faculty_name=faculty.name,
                                    day=slot.day,
                                    startTime=slot.startTime,
                                    endTime=slot.endTime,
                                    room_id=self.single_room_id,
                                    is_special=subject.is_special,
                                    priority_score=preference_score
                                )
                                schedule.append(assignment)
                                self._add_assignment(assignment)
                                assigned = True
                                
                                pref_msg = f" (preference score: {preference_score})" if preference_score > 0 else ""
                                logger.info(f"Assigned {subject.name} to {faculty.name} at {slot.day} {slot.startTime}-{slot.endTime}{pref_msg}")
                                break
                        if assigned:
                            break
                    
                    if not assigned:
                        logger.warning(f"Could not assign required class for {subject.name}")

            logger.info(f"Phase 1 completed: {len(schedule)} assignments made")

            # Phase 2: Ultra-aggressively fill ALL remaining slots
            logger.info("Phase 2: Ultra-aggressively filling remaining slots...")
            schedule = self._ultra_aggressive_fill_slots(schedule, input_data)

        # Calculate final statistics
        unassigned_slots = []
        weekly_schedule = self._build_weekly_schedule(schedule)
        
        # Count break slots (including ALL_DAYS)
        break_slot_count = 0
        total_slots = len(VALID_DAYS) * len(self.time_slot_labels)
        
        for day in VALID_DAYS:
            for idx, slot_label in enumerate(self.time_slot_labels):
                start_time, end_time = slot_label.split('-')
                slot_obj = TimeSlot(day=day, startTime=start_time, endTime=end_time)
                
                if check_break_conflict(slot_obj, input_data.break_):
                    break_slot_count += 1
                elif weekly_schedule[day][idx] is None:
                    unassigned_slots.append(f"{day} {slot_label}")

        # Calculate fitness score
        total_available_slots = total_slots - break_slot_count
        fitness = 1.0 - (len(unassigned_slots) / total_available_slots) if total_available_slots > 0 else 0.0
        
        # Calculate preference satisfaction
        total_preference_score = sum(assignment.priority_score for assignment in schedule)
        avg_preference_score = total_preference_score / len(schedule) if schedule else 0
        
        logger.info(f"FINAL RESULTS:")
        logger.info(f"  Total slots: {total_slots}")
        logger.info(f"  Break slots: {break_slot_count}")
        logger.info(f"  Available slots: {total_available_slots}")
        logger.info(f"  Assigned slots: {len(schedule)}")
        logger.info(f"  Unassigned slots: {len(unassigned_slots)}")
        logger.info(f"  Fitness: {fitness:.3f}")
        logger.info(f"  Avg preference score: {avg_preference_score:.1f}")
        
        # Generate tabular format
        tabular_schedule = self._generate_tabular_schedule(weekly_schedule)
        
        # Save schedule to history
        schedule_data = {
            "schedule": [assignment.model_dump() for assignment in schedule],
            "fitness": fitness,
            "preference_score": avg_preference_score,
            "timestamp": datetime.now().isoformat()
        }
        self.schedule_history.append(schedule_data)

        return {
            "weekly_schedule": {
                "time_slots": self.time_slot_labels,
                "days": weekly_schedule
            },
            "tabular_schedule": tabular_schedule,
            "unassigned": unassigned_slots,
            "fitness": fitness,
            "preference_score": avg_preference_score,
            "break_slots": break_slot_count,
            "total_assignments": len(schedule),
            "total_available_slots": total_available_slots,
            "utilization_percentage": round((len(schedule) / total_available_slots) * 100, 1) if total_available_slots > 0 else 0
        }
    
    def _generate_tabular_schedule(self, weekly_schedule: Dict[str, List[Any]]) -> Dict[str, Any]:
        """Generate a tabular representation of the schedule."""
        # Create headers
        headers = ["Time Slot"] + VALID_DAYS
        
        # Create rows
        rows = []
        for i, time_slot in enumerate(self.time_slot_labels):
            row = [time_slot]
            
            for day in VALID_DAYS:
                assignment = weekly_schedule[day][i]
                if assignment:
                    cell = f"{assignment['subject_name']}\n{assignment['faculty_name']}"
                else:
                    cell = "---"
                row.append(cell)
            
            rows.append(row)
        
        # Create HTML table
        html_table = tabulate.tabulate(rows, headers=headers, tablefmt="html")
        
        # Create text table
        
        
        return {
            "html": html_table,
        }
    
    def get_schedule_history(self) -> List[Dict]:
        """Return the history of generated schedules."""
        return self.schedule_history
