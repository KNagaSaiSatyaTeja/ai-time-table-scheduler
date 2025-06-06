from datetime import datetime
from typing import List, Dict, Any
from pymongo import MongoClient
from bson import ObjectId
from model import ScheduleInput, ScheduleAssignment
from constraints import ConstraintChecker
from genetic_algorithm import GeneticAlgorithm
import os

class SchedulerService:
    def __init__(self):
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.client = MongoClient(mongo_uri)
        self.db = self.client.timetable
        self.collection = self.db.schedules

    def _load_existing_allocations(self) -> List[ScheduleAssignment]:
        existing = self.collection.find({})
        schedule = []
        for record in existing:
            assignment = ScheduleAssignment(
                subject=record["subject"],
                faculty_id=record["faculty_id"],
                faculty_name=record["faculty_name"],
                day=record["day"],
                startTime=record["startTime"],
                endTime=record["endTime"],
                student_group=record["student_group"],
                room_id=record["room_id"]
            )
            schedule.append(assignment)
        return schedule

    def generate_schedule(self, input_data: ScheduleInput, use_ga: bool = False) -> Dict[str, Any]:
        try:
            # Convert input data to dictionary
            schedule_data = input_data.dict()
            
            # Add your scheduling logic here
            # This is a placeholder that just saves the input data
            result = self.collection.insert_one(schedule_data)
            
            return {
                "success": True,
                "schedule_id": str(result.inserted_id),
                "message": "Schedule generated successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "unassigned": str(e)
            }

        constraint_checker = ConstraintChecker(input_data)
        schedule: List[ScheduleAssignment] = self._load_existing_allocations()
        unassigned = []

        if use_ga:
            # Use Genetic Algorithm
            ga = GeneticAlgorithm(input_data)
            best_schedule, fitness = ga.run()
            schedule.extend(best_schedule)
        else:
            # CSP with MRV/LCV
            faculty_slots: Dict[str, List[TimeSlot]] = {}
            room_slots: Dict[str, List[TimeSlot]] = {}
            group_slots: Dict[str, List[TimeSlot]] = {}
            
            for assignment in schedule:
                slot = TimeSlot(day=assignment.day, startTime=assignment.startTime, endTime=assignment.endTime)
                faculty_slots.setdefault(assignment.faculty_id, []).append(slot)
                room_slots.setdefault(assignment.room_id, []).append(slot)
                group_slots.setdefault(assignment.student_group, []).append(slot)
            
            subjects_to_assign = sorted(
                input_data.subjects,
                key=lambda s: sum(
                    1 for faculty in s.faculty
                    for slot in faculty.availability
                    if constraint_checker.is_within_college_time(slot)
                    and not any(constraint_checker.check_time_conflict(slot, existing)
                               for existing in faculty_slots.get(faculty.id, []) + room_slots.get("R1", []) + room_slots.get("R2", []) + group_slots.get(s.student_group, []))
                )
            )
            
            for subject in subjects_to_assign:
                assigned = False
                possible_assignments = []
                for faculty in subject.faculty:
                    for slot in faculty.availability:
                        for room_id in input_data.rooms:
                            assignment = ScheduleAssignment(
                                subject=subject.name,
                                faculty_id=faculty.id,
                                faculty_name=faculty.name,
                                day=slot.day,
                                startTime=slot.startTime,
                                endTime=slot.endTime,
                                student_group=subject.student_group,
                                room_id=room_id
                            )
                            temp_schedule = schedule + [assignment]
                            fitness = constraint_checker.calculate_fitness(temp_schedule)
                            possible_assignments.append((assignment, fitness))
                
                possible_assignments.sort(key=lambda x: x[1])
                
                for assignment, _ in possible_assignments:
                    temp_schedule = schedule + [assignment]
                    if not constraint_checker.check_constraints(temp_schedule):
                        schedule.append(assignment)
                        slot = TimeSlot(day=assignment.day, startTime=assignment.startTime, endTime=assignment.endTime)
                        faculty_slots.setdefault(assignment.faculty_id, []).append(slot)
                        room_slots.setdefault(assignment.room_id, []).append(slot)
                        group_slots.setdefault(assignment.student_group, []).append(slot)
                        assigned = True
                        break
                
                if not assigned:
                    unassigned.append(subject.name)
        
        # Save to MongoDB
        fitness = constraint_checker.calculate_fitness(schedule)
        schedule_id = None
        if schedule:
            schedule_data = [
                {
                    "subject": a.subject,
                    "faculty_id": a.faculty_id,
                    "faculty_name": a.faculty_name,
                    "day": a.day,
                    "startTime": a.startTime,
                    "endTime": a.endTime,
                    "student_group": a.student_group,
                    "room_id": a.room_id
                } for a in schedule
            ]
            schedule_id = self.collection.insert_one({"schedule": schedule_data, "fitness": fitness}).inserted_id
        
        return {
            "schedule": schedule,
            "fitness": fitness,
            "schedule_id": str(schedule_id) if schedule_id else None,
            "unassigned": unassigned
        }

    def get_schedule(self, schedule_id: str) -> Dict[str, Any]:
        try:
            schedule = self.collection.find_one({"_id": ObjectId(schedule_id)})
            if schedule:
                schedule["_id"] = str(schedule["_id"])
            return schedule
        except Exception as e:
            raise Exception(f"Error retrieving schedule: {str(e)}")