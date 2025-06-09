# scheduler.py
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from model import ScheduleInput, ScheduleAssignment, TimeSlot, Break
from utils import check_time_conflict, check_break_conflict, time_to_minutes, minutes_to_time, VALID_DAYS, generate_time_slots, generate_weekly_time_slots
from pymongo import MongoClient
import os
import random
from genetic_algorithm import GeneticAlgorithm
from datetime import datetime

class ConstraintChecker:
    def __init__(self, subjects: List):
        self.subjects = subjects

    def sort_subjects_by_constraints(self, subjects: List) -> List:
        """Sort subjects by scheduling difficulty (e.g., fewer faculty, more classes)."""
        return sorted(subjects, key=lambda s: (len(s.faculty), -s.no_of_classes_per_week))

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

    def check_constraints(self, faculty_id: str, time_slot: TimeSlot, room_id: str, input_data: ScheduleInput) -> bool:
        """Placeholder for additional constraint checks (e.g., faculty preferences)."""
        return True

class SchedulerService:
    def __init__(self):
        self.assignments: Dict[str, List[ScheduleAssignment]] = {}
        self.all_assignments: List[ScheduleAssignment] = []
        self.constraint_checker = None
        self.single_room_id = "R1"
        self.time_slot_labels: List[str] = []
        self.fixed_slots: List[TimeSlot] = []

        mongo_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.client = MongoClient(mongo_url)
        self.db = self.client["schedulerDB"]
        self.collection = self.db["schedules"]

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
        self._validate_time(input_data.college_time.startTime, "college_time startTime")
        self._validate_time(input_data.college_time.endTime, "college_time endTime")

    def _is_valid_assignment(self, faculty_id: str, time_slot: TimeSlot, room_id: str, input_data: ScheduleInput) -> bool:
        """Check if an assignment is valid using ConstraintChecker and existing assignments."""
        if not self.constraint_checker.check_constraints(faculty_id, time_slot, room_id, input_data):
            return False
        if check_break_conflict(time_slot, input_data.break_):
            print(f"[DEBUG] Break conflict for slot {time_slot.day} {time_slot.startTime}-{time_slot.endTime}")
            return False
        for assignment in self.all_assignments:
            if assignment.faculty_id == faculty_id or assignment.room_id == room_id:
                assigned_slot = TimeSlot(
                    day=assignment.day,
                    startTime=assignment.startTime,
                    endTime=assignment.endTime
                )
                if check_time_conflict(time_slot, assigned_slot):
                    print(f"[DEBUG] Conflict for faculty {faculty_id} or room {room_id} at {time_slot.day} {time_slot.startTime}-{time_slot.endTime}")
                    return False
        return True

    def _add_assignment(self, assignment: ScheduleAssignment):
        """Add an assignment to the internal tracking dictionaries."""
        self.all_assignments.append(assignment)
        if assignment.faculty_id not in self.assignments:
            self.assignments[assignment.faculty_id] = []
        self.assignments[assignment.faculty_id].append(assignment)
        if assignment.room_id not in self.assignments:
            self.assignments[assignment.room_id] = []
        self.assignments[assignment.room_id].append(assignment)

    def _build_weekly_schedule(self, schedule: List[ScheduleAssignment]) -> Dict[str, List[Any]]:
        """Convert flat schedule into weekly table format."""
        weekly_schedule = {day: [None] * len(self.time_slot_labels) for day in VALID_DAYS}
        for assignment in schedule:
            slot_label = f"{assignment.startTime}-{assignment.endTime}"
            try:
                slot_idx = self.time_slot_labels.index(slot_label)
                weekly_schedule[assignment.day][slot_idx] = assignment.model_dump()
            except ValueError:
                print(f"[WARN] Slot {slot_label} not found in time_slot_labels")
        return weekly_schedule

    def _get_slot_duration(self, slot: TimeSlot) -> int:
        """Calculate the duration of a slot in minutes."""
        try:
            return time_to_minutes(slot.endTime) - time_to_minutes(slot.startTime)
        except ValueError as e:
            print(f"[ERROR] Failed to calculate slot duration: {e}")
            return -1

    def _generate_weekly_slots(self, start_time: str, end_time: str, breaks: List[Break], subjects: List) -> Tuple[List[str], List[TimeSlot]]:
        """Generate time slots for all days using the updated generate_weekly_time_slots."""
        return generate_weekly_time_slots(start_time, end_time, breaks, subjects)

    def _fill_remaining_slots(self, schedule: List[ScheduleAssignment], input_data: ScheduleInput) -> List[ScheduleAssignment]:
        """Fill all remaining non-break slots with available subjects and faculty."""
        weekly_schedule = self._build_weekly_schedule(schedule)

        subject_counts = {subject.name: 0 for subject in input_data.subjects}
        for a in schedule:
            subject_counts[a.subject_name] += 1

        new_assignments = schedule.copy()
        used_slots_per_faculty = defaultdict(list)
        used_slots_per_room = defaultdict(list)
        for a in new_assignments:
            slot = TimeSlot(day=a.day, startTime=a.startTime, endTime=a.endTime)
            used_slots_per_faculty[a.faculty_id].append(slot)
            used_slots_per_room[a.room_id].append(slot)

        break_slots = set()
        for day in VALID_DAYS:
            for slot in self.fixed_slots:
                if slot.day != day:
                    continue
                slot_obj = TimeSlot(day=day, startTime=slot.startTime, endTime=slot.endTime)
                if check_break_conflict(slot_obj, input_data.break_):
                    slot_label = f"{slot.startTime}-{slot.endTime}"
                    if slot_label in self.time_slot_labels:
                        break_slots.add((day, self.time_slot_labels.index(slot_label)))

        for day in VALID_DAYS:
            for slot_idx, slot_label in enumerate(self.time_slot_labels):
                if weekly_schedule[day][slot_idx] is not None:
                    continue

                if (day, slot_idx) in break_slots:
                    print(f"[INFO] Slot {day} {slot_label} is a break slot, keeping unassigned")
                    continue

                slot = next((s for s in self.fixed_slots if s.day == day and f"{s.startTime}-{s.endTime}" == slot_label), None)
                if not slot:
                    print(f"[ERROR] Could not find slot for {day} {slot_label}")
                    continue

                slot_obj = TimeSlot(day=day, startTime=slot.startTime, endTime=slot.endTime)

                subjects_to_consider = [
                    s for s in input_data.subjects
                    if self._get_slot_duration(slot) == s.time
                ]

                if not subjects_to_consider:
                    print(f"[WARN] No subjects available to fill slot {day} {slot_label}")
                    continue

                random.shuffle(subjects_to_consider)
                assigned = False
                for subject in subjects_to_consider:
                    for faculty in random.sample(subject.faculty, len(subject.faculty)):
                        if self._is_valid_assignment(faculty.id, slot, self.single_room_id, input_data):
                            assignment = ScheduleAssignment(
                                subject_name=subject.name,
                                faculty_id=faculty.id,
                                faculty_name=faculty.name,
                                day=slot.day,
                                startTime=slot.startTime,
                                endTime=slot.endTime,
                                room_id=self.single_room_id
                            )
                            new_assignments.append(assignment)
                            self._add_assignment(assignment)
                            used_slots_per_faculty[faculty.id].append(slot)
                            used_slots_per_room[self.single_room_id].append(slot)
                            subject_counts[subject.name] += 1
                            assigned = True
                            print(f"[SUCCESS] Filled slot {day} {slot_label} with {subject.name} by {faculty.name}")
                            break
                    if assigned:
                        break

                if not assigned:
                    print(f"[ERROR] Could not fill slot {day} {slot_label} with any subject")

        return new_assignments

    def _run_genetic_algorithm(self, input_data: ScheduleInput) -> Tuple[List[ScheduleAssignment], float]:
        """Run the genetic algorithm to generate a schedule."""
        ga = GeneticAlgorithm(
            input_data=input_data,
            fixed_slots=self.fixed_slots,
            pop_size=50,
            generations=30,
            fixed_room_id=self.single_room_id,
            conflict_checker=self._is_valid_assignment
        )
        schedule, fitness = ga.run()
        return schedule, fitness

    def generate_schedule(self, input_data: ScheduleInput, use_ga: bool = False) -> Dict[str, Any]:
        """Generate a weekly schedule based on input data."""
        try:
            self._validate_input(input_data)
        except ValueError as e:
            print(f"[ERROR] Input validation failed: {e}")
            raise

        self.assignments.clear()
        self.all_assignments.clear()

        if not input_data.rooms:
            raise ValueError("At least one room must be provided.")
        self.single_room_id = input_data.rooms[0]

        self.time_slot_labels, self.fixed_slots = self._generate_weekly_slots(
            input_data.college_time.startTime,
            input_data.college_time.endTime,
            input_data.break_,
            input_data.subjects
        )
        if not self.time_slot_labels:
            raise ValueError("No valid time slots generated. Check college time, breaks, and subject durations.")

        self.collection.delete_many({})
        print("[DEBUG] Cleared MongoDB collection")

        existing = list(self.collection.find())
        print(f"[DEBUG] Loaded {len(existing)} existing schedules from MongoDB")
        for doc in existing:
            for a in doc.get("schedule", []):
                try:
                    self._add_assignment(ScheduleAssignment(**a))
                except Exception as e:
                    print(f"[ERROR] Failed to load assignment from MongoDB: {e}")

        self.constraint_checker = ConstraintChecker(input_data.subjects)

        if use_ga:
            schedule, fitness = self._run_genetic_algorithm(input_data)
        else:
            schedule = []
            subjects = self.constraint_checker.sort_subjects_by_constraints(input_data.subjects)
            subject_counts = {subject.name: 0 for subject in subjects}

            for subject in subjects:
                required_classes = subject.no_of_classes_per_week
                while subject_counts[subject.name] < required_classes:
                    assigned = False
                    shuffled_faculty = random.sample(subject.faculty, len(subject.faculty))
                    for faculty in shuffled_faculty:
                        valid_slots = self.constraint_checker.get_valid_slots(
                            faculty.availability,
                            self.fixed_slots,
                            subject.time
                        )

                        if not valid_slots:
                            print(f"[DEBUG] No valid slots for {subject.name} with faculty {faculty.name}")
                            continue

                        for slot in random.sample(valid_slots, len(valid_slots)):
                            break_conflict = check_break_conflict(slot, input_data.break_)
                            if break_conflict:
                                continue

                            if self._is_valid_assignment(faculty.id, slot, self.single_room_id, input_data):
                                assignment = ScheduleAssignment(
                                    subject_name=subject.name,
                                    faculty_id=faculty.id,
                                    faculty_name=faculty.name,
                                    day=slot.day,
                                    startTime=slot.startTime,
                                    endTime=slot.endTime,
                                    room_id=self.single_room_id
                                )
                                schedule.append(assignment)
                                self._add_assignment(assignment)
                                subject_counts[subject.name] += 1
                                assigned = True
                                print(f"[SUCCESS] Assigned {subject.name} to {faculty.name} at {slot.day} {slot.startTime}-{slot.endTime}")
                                break
                        if assigned:
                            break
                    if not assigned:
                        print(f"[WARN] Could not assign {subject.name} (required: {required_classes}, assigned: {subject_counts[subject.name]})")
                        break

        schedule = self._fill_remaining_slots(schedule, input_data)
        unassigned_slots = []
        weekly_schedule = self._build_weekly_schedule(schedule)

        break_slots = set()
        for day in VALID_DAYS:
            for slot in self.fixed_slots:
                if slot.day != day:
                    continue
                slot_obj = TimeSlot(day=day, startTime=slot.startTime, endTime=slot.endTime)
                if check_break_conflict(slot_obj, input_data.break_):
                    slot_label = f"{slot.startTime}-{slot.endTime}"
                    if slot_label in self.time_slot_labels:
                        break_slots.add((day, self.time_slot_labels.index(slot_label)))

        for day in weekly_schedule:
            for idx, slot in enumerate(weekly_schedule[day]):
                if slot is None and (day, idx) not in break_slots:
                    slot_label = self.time_slot_labels[idx]
                    unassigned_slots.append(f"{day} {slot_label}")

        fitness = 1.0 - (len(unassigned_slots) / (len(VALID_DAYS) * len(self.time_slot_labels))) if self.time_slot_labels else 0.0
        schedule_data = {
            "schedule": [assignment.model_dump() for assignment in schedule],
            "fitness": fitness,
            "timestamp": datetime.now().isoformat()
        }
        self.collection.insert_one(schedule_data)

        return {
            "weekly_schedule": {
                "time_slots": self.time_slot_labels,
                "days": weekly_schedule
            },
            "unassigned": unassigned_slots,
            "fitness": fitness
        }