# main.py
from fastapi import FastAPI, HTTPException
from model import ScheduleInput
from scheduler import SchedulerService

app = FastAPI()
scheduler_service = SchedulerService()

@app.post("/generate_schedule")
async def generate_schedule(input_data: ScheduleInput, use_ga: bool = False):
    try:
        result = scheduler_service.generate_schedule(input_data, use_ga)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")