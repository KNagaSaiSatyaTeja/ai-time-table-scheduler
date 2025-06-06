from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import ScheduleInput
from scheduler import SchedulerService
from dotenv import load_dotenv
import os
from bson import ObjectId
from typing import Dict, Any

load_dotenv()
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scheduler service
scheduler = SchedulerService()

@app.post("/generate")
async def generate_schedule(input_data: ScheduleInput, use_ga: bool = False) -> Dict[str, Any]:
    try:
        result = scheduler.generate_schedule(input_data, use_ga)
        if result.get("schedule_id"):
            return result
        raise HTTPException(
            status_code=400, 
            detail={"message": "Failed to generate schedule", "errors": result.get("unassigned", [])}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail={"message": "Internal server error", "error": str(e)}
        )

@app.get("/schedule/{schedule_id}")
async def get_schedule(schedule_id: str) -> Dict[str, Any]:
    try:
        schedule_data = scheduler.collection.find_one({"_id": ObjectId(schedule_id)})
        if schedule_data:
            schedule_data["_id"] = str(schedule_data["_id"])  # Convert ObjectId to string
            return schedule_data
        raise HTTPException(status_code=404, detail="Schedule not found")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": "Internal server error", "error": str(e)}
        )