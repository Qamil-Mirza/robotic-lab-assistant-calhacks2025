import sys
import time
import asyncio
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import threading

# Add parent directory to path for unitree_sdk2py imports
sys.path.append(str(Path(__file__).parent.parent))

from unitree_sdk2py.core.channel import ChannelFactoryInitialize
from unitree_sdk2py.g1.loco.g1_loco_client import LocoClient

app = FastAPI(
    title="Robotic Lab Assistant API - Unitree G1",
    description="API for controlling the Unitree G1 humanoid robot",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global robot client
loco_client: Optional[LocoClient] = None
robot_lock = threading.Lock()
robot_initialized = False
network_interface = None

# Pydantic models
class WalkRequest(BaseModel):
    distance: float = Field(default=1.0, description="Distance to walk in meters (positive = forward, negative = backward)")
    speed: float = Field(default=0.3, description="Walking speed (0.0 to 1.0)")

class MoveRequest(BaseModel):
    forward: float = Field(default=0.0, description="Forward speed (-1.0 to 1.0)")
    lateral: float = Field(default=0.0, description="Lateral speed (-1.0 to 1.0)")
    rotation: float = Field(default=0.0, description="Rotation speed (-1.0 to 1.0)")
    duration: float = Field(default=1.0, description="Duration in seconds")

class RobotStatus(BaseModel):
    initialized: bool
    status: str
    message: str

# Initialize robot on startup
@app.on_event("startup")
async def startup_event():
    global loco_client, robot_initialized, network_interface
    try:
        print("Initializing G1 robot connection...")
        # Get network interface from environment variable or use default
        network_interface = os.getenv("ROBOT_NETWORK_INTERFACE", "en7")
        
        if network_interface:
            print(f"Using network interface: {network_interface}")
            ChannelFactoryInitialize(0, network_interface)
        else:
            print("Using default network interface")
            ChannelFactoryInitialize(0)
        
        loco_client = LocoClient()
        loco_client.SetTimeout(10.0)
        loco_client.Init()
        robot_initialized = True
        print("G1 robot initialized successfully!")
    except Exception as e:
        print(f"Failed to initialize robot: {e}")
        print("Tip: Set ROBOT_NETWORK_INTERFACE environment variable if connection fails")
        robot_initialized = False

# Cleanup on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    global loco_client
    if loco_client:
        try:
            # Stop any movement and put in safe state
            loco_client.StopMove()
            print("Robot stopped and connection closed.")
        except Exception as e:
            print(f"Error during shutdown: {e}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - returns API information"""
    return {
        "message": "Robotic Lab Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "robot_initialized": robot_initialized
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "robot_initialized": robot_initialized
    }

# Get robot status
@app.get("/api/robot/status", response_model=RobotStatus)
async def get_robot_status():
    """Get current robot status"""
    return {
        "initialized": robot_initialized,
        "status": "ready" if robot_initialized else "not_initialized",
        "message": "Robot is ready to receive commands" if robot_initialized else "Robot not initialized"
    }

# Stand up the robot (G1 specific: from squat to standing)
@app.post("/api/robot/stand-up")
async def stand_up():
    """Make the robot stand up from squat position"""
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        with robot_lock:
            # G1 needs to be in damp mode first, then stand up
            loco_client.Damp()
            await asyncio.sleep(0.5)
            result = loco_client.Squat2StandUp()
        return {
            "status": "success",
            "message": "G1 robot standing up",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stand up: {str(e)}")

# Stand down the robot (G1 specific: from standing to squat)
@app.post("/api/robot/squat")
async def squat():
    """Make the robot squat down from standing position"""
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        with robot_lock:
            result = loco_client.StandUp2Squat()
        return {
            "status": "success",
            "message": "G1 robot squatting down",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to squat: {str(e)}")

# Low stand position
@app.post("/api/robot/low-stand")
async def low_stand():
    """Put robot in low standing position"""
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        with robot_lock:
            result = loco_client.LowStand()
        return {
            "status": "success",
            "message": "G1 robot in low stand position",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to low stand: {str(e)}")

# High stand position
@app.post("/api/robot/high-stand")
async def high_stand():
    """Put robot in high standing position"""
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        with robot_lock:
            result = loco_client.HighStand()
        return {
            "status": "success",
            "message": "G1 robot in high stand position",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to high stand: {str(e)}")

# Walk straight
@app.post("/api/robot/walk-straight")
async def walk_straight(request: WalkRequest):
    """
    Make the G1 robot walk straight for a specified distance.
    
    The distance is approximate based on speed and time.
    Adjust speed to fine-tune the actual distance covered.
    """
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        # Clamp speed between 0 and 1
        speed = max(0.0, min(1.0, abs(request.speed)))
        
        # Calculate duration based on distance and speed
        # Approximate: at speed 0.3, robot moves ~0.3 m/s
        duration = abs(request.distance) / speed if speed > 0 else 0
        
        # Determine direction
        forward_speed = speed if request.distance >= 0 else -speed
        
        with robot_lock:
            # Start moving
            result = loco_client.Move(forward_speed, 0, 0)
            
        
        return {
            "status": "success",
            "message": f"G1 robot walked {request.distance}m at speed {speed}",
            "distance": request.distance,
            "speed": speed,
            "duration": duration,
            "result": result
        }
    except Exception as e:
        # Make sure to stop the robot if something goes wrong
        try:
            loco_client.StopMove()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to walk: {str(e)}")

# Custom move command
@app.post("/api/robot/move")
async def move_robot(request: MoveRequest):
    """
    Move the G1 robot with custom forward, lateral, and rotation speeds.
    All speeds should be between -1.0 and 1.0.
    """
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        # Clamp all values between -1 and 1
        forward = max(-1.0, min(1.0, request.forward))
        lateral = max(-1.0, min(1.0, request.lateral))
        rotation = max(-1.0, min(1.0, request.rotation))
        
        with robot_lock:
            # Start moving
            result = loco_client.Move(forward, lateral, rotation)
            
            # Wait for duration
            await asyncio.sleep(request.duration)
            
            # Stop moving
            loco_client.StopMove()
        
        return {
            "status": "success",
            "message": f"G1 robot moved for {request.duration}s",
            "forward": forward,
            "lateral": lateral,
            "rotation": rotation,
            "duration": request.duration,
            "result": result
        }
    except Exception as e:
        # Make sure to stop the robot if something goes wrong
        try:
            loco_client.StopMove()
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to move: {str(e)}")

# Emergency stop
@app.post("/api/robot/stop")
async def emergency_stop():
    """Emergency stop - immediately stop all robot movement"""
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        with robot_lock:
            loco_client.StopMove()
        return {
            "status": "success",
            "message": "G1 robot stopped"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop: {str(e)}")

# Damp mode (relaxed state)
@app.post("/api/robot/damp")
async def damp_mode():
    """Put robot in damp mode (relaxed state, motors disabled)"""
    if not robot_initialized or not loco_client:
        raise HTTPException(status_code=503, detail="Robot not initialized")
    
    try:
        with robot_lock:
            result = loco_client.Damp()
        return {
            "status": "success",
            "message": "G1 robot in damp mode",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enter damp mode: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("WARNING: Please ensure there are no obstacles around the robot.")
    print("Starting server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)

