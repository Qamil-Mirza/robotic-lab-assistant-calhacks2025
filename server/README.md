# Robotic Lab Assistant Server - Unitree G1

FastAPI server for controlling the Unitree G1 humanoid robot using the unitree_sdk2_python module.

## Features

- 🤖 Control Unitree G1 humanoid robot
- 🚶 Walk straight commands with distance and speed control
- 🎮 Custom movement with forward, lateral, and rotation control
- 🛑 Emergency stop functionality
- 🔧 Robot state management (stand up, squat, low/high stand, damp mode)
- 👋 Humanoid features (wave hand, shake hand)
- 📡 RESTful API with automatic documentation

## Setup with uv

### Prerequisites

1. Install uv if you haven't already:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

2. Make sure the `unitree_sdk2_python` package is installed in the parent directory

3. Connect to the G1 robot's network

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
uv pip install -e .
```

Or with a virtual environment:
```bash
uv venv
source .venv/bin/activate  # On Unix/macOS
uv pip install -e .
```

## Configuration

### CycloneDDS Setup (Required)

The Unitree SDK requires CycloneDDS. The project includes a built version in `cyclonedds/install`.

**Set environment variables:**

```bash
# Set CycloneDDS home
export CYCLONEDDS_HOME=/Users/qamilmirza/Code/robotic-lab-assistant-calhacks2025/cyclonedds/install

# Set library path (macOS)
export DYLD_LIBRARY_PATH=$CYCLONEDDS_HOME/lib:$DYLD_LIBRARY_PATH

# For Linux, use LD_LIBRARY_PATH instead:
# export LD_LIBRARY_PATH=$CYCLONEDDS_HOME/lib:$LD_LIBRARY_PATH
```

**Or use the provided start script** (recommended - handles environment automatically):
```bash
./start.sh
```

### Network Interface (Optional)

If you need to specify a network interface to connect to the G1:

```bash
export ROBOT_NETWORK_INTERFACE=eth0  # or your network interface name
```

You can find your network interface with:
```bash
ifconfig  # macOS/Linux
```

## Running the Server

**⚠️ WARNING: Ensure there are no obstacles around the robot before running commands!**

### Option 1: Use the start script (Recommended)

The start script automatically sets up CycloneDDS environment variables:

```bash
cd server
./start.sh
```

### Option 2: Manual start

Set environment variables first, then run:

```bash
cd server

# Set CycloneDDS variables
export CYCLONEDDS_HOME=/Users/qamilmirza/Code/robotic-lab-assistant-calhacks2025/cyclonedds/install
export DYLD_LIBRARY_PATH=$CYCLONEDDS_HOME/lib:$DYLD_LIBRARY_PATH

# Run the server
python server.py
```

Or with uvicorn:
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### With custom network interface:

```bash
export ROBOT_NETWORK_INTERFACE=eth0
./start.sh
```

The server will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Basic Control

- `GET /` - Root endpoint with API information
- `GET /health` - Health check
- `GET /api/robot/status` - Get robot initialization status

### Robot State

- `POST /api/robot/stand-up` - Make the robot stand up from squat
- `POST /api/robot/squat` - Make the robot squat down
- `POST /api/robot/low-stand` - Put robot in low standing position
- `POST /api/robot/high-stand` - Put robot in high standing position
- `POST /api/robot/damp` - Put robot in relaxed state (motors off)
- `POST /api/robot/stop` - Emergency stop

### Movement Commands

#### Walk Straight
`POST /api/robot/walk-straight`

Make the G1 robot walk straight for a specified distance.

**Request body:**
```json
{
  "distance": 1.0,  // Distance in meters (positive = forward, negative = backward)
  "speed": 0.3      // Speed from 0.0 to 1.0
}
```

**Example:**
```bash
# Walk forward 2 meters at speed 0.5
curl -X POST http://localhost:8000/api/robot/walk-straight \
  -H "Content-Type: application/json" \
  -d '{"distance": 2.0, "speed": 0.5}'
```

#### Custom Move
`POST /api/robot/move`

Move the G1 robot with custom control over all axes.

**Request body:**
```json
{
  "forward": 0.3,   // Forward/backward speed (-1.0 to 1.0)
  "lateral": 0.0,   // Left/right speed (-1.0 to 1.0)
  "rotation": 0.0,  // Rotation speed (-1.0 to 1.0)
  "duration": 2.0   // Duration in seconds
}
```

**Example:**
```bash
# Move forward for 3 seconds
curl -X POST http://localhost:8000/api/robot/move \
  -H "Content-Type: application/json" \
  -d '{"forward": 0.3, "lateral": 0.0, "rotation": 0.0, "duration": 3.0}'
```

### Humanoid Features

#### Wave Hand
`POST /api/robot/wave-hand?turn_around=false`

Make the G1 wave its hand (optionally turn around).

**Example:**
```bash
# Wave hand
curl -X POST "http://localhost:8000/api/robot/wave-hand?turn_around=false"

# Wave hand and turn around
curl -X POST "http://localhost:8000/api/robot/wave-hand?turn_around=true"
```

#### Shake Hand
`POST /api/robot/shake-hand`

Make the G1 shake hands.

**Example:**
```bash
curl -X POST http://localhost:8000/api/robot/shake-hand
```

## Usage Examples

### 1. Initialize and Stand Up
```bash
# Check status
curl http://localhost:8000/api/robot/status

# Stand up from squat
curl -X POST http://localhost:8000/api/robot/stand-up
```

### 2. Walk Forward
```bash
# Walk 1 meter forward at default speed (0.3)
curl -X POST http://localhost:8000/api/robot/walk-straight \
  -H "Content-Type: application/json" \
  -d '{"distance": 1.0}'

# Walk 2 meters forward at speed 0.5
curl -X POST http://localhost:8000/api/robot/walk-straight \
  -H "Content-Type: application/json" \
  -d '{"distance": 2.0, "speed": 0.5}'
```

### 3. Walk Multiple Times
To walk the same distance multiple times, just call the endpoint multiple times:

```bash
# Walk 0.5m forward, 3 times
for i in {1..3}; do
  curl -X POST http://localhost:8000/api/robot/walk-straight \
    -H "Content-Type: application/json" \
    -d '{"distance": 0.5, "speed": 0.3}'
  sleep 1
done
```

### 4. Social Interaction
```bash
# Wave hand
curl -X POST "http://localhost:8000/api/robot/wave-hand?turn_around=false"

# Shake hands
curl -X POST http://localhost:8000/api/robot/shake-hand
```

### 5. Emergency Stop
```bash
curl -X POST http://localhost:8000/api/robot/stop
```

### 6. Return to Rest
```bash
# Squat down
curl -X POST http://localhost:8000/api/robot/squat

# Or go to damp mode
curl -X POST http://localhost:8000/api/robot/damp
```

## Complete Workflow Example

```bash
# 1. Stand up
curl -X POST http://localhost:8000/api/robot/stand-up
sleep 2

# 2. Walk forward 1 meter
curl -X POST http://localhost:8000/api/robot/walk-straight \
  -H "Content-Type: application/json" \
  -d '{"distance": 1.0, "speed": 0.3}'
sleep 2

# 3. Wave hand
curl -X POST "http://localhost:8000/api/robot/wave-hand?turn_around=false"
sleep 2

# 4. Walk back
curl -X POST http://localhost:8000/api/robot/walk-straight \
  -H "Content-Type: application/json" \
  -d '{"distance": -1.0, "speed": 0.3}'
sleep 2

# 5. Squat down
curl -X POST http://localhost:8000/api/robot/squat
```

## Interactive API Documentation

Visit http://localhost:8000/docs to access the interactive Swagger UI where you can:
- See all available endpoints
- Test endpoints directly from the browser
- View request/response schemas
- See example values

## Tuning Parameters

### Walking Distance
The `distance` parameter in `/api/robot/walk-straight` is approximate. Fine-tune by:
1. Adjusting the `speed` parameter (lower speed = more precise control)
2. Testing actual distance covered and calibrating
3. The calculation assumes ~speed m/s (e.g., speed=0.3 → ~0.3 m/s)

### Speed Values
- `0.0` - No movement
- `0.3` - Slow, safe speed (recommended for testing)
- `0.5` - Medium speed
- `1.0` - Maximum speed

**Start with lower speeds (0.2-0.3) and gradually increase!**

## G1-Specific Notes

### Standing Up
The G1 requires a specific sequence to stand up:
1. Enter damp mode first
2. Wait 0.5 seconds
3. Execute `Squat2StandUp()`

This is automatically handled by the `/api/robot/stand-up` endpoint.

### Humanoid Features
Unlike quadruped robots, the G1 supports humanoid gestures:
- Wave hand (with optional turn around)
- Shake hands (useful for social interaction)

## Troubleshooting

### Robot not initializing
- Ensure you're on the same network as the G1 robot
- Check robot is powered on and in network mode
- Try setting the `ROBOT_NETWORK_INTERFACE` environment variable
- Verify unitree_sdk2_python is properly installed

### Robot doesn't move expected distance
- Lower the speed for better precision
- Calibrate by testing actual distance vs requested
- Ensure floor surface is consistent
- The G1's walking characteristics may differ from quadrupeds

### Connection timeout
- Check network connection to robot
- Verify network interface is correct
- Increase timeout in `loco_client.SetTimeout(10.0)` if needed

### StopMove not defined
If you get an error about `StopMove()`, the G1 client might use a different method. Check the SDK documentation or simply don't call stop (the movement commands are time-based).

## Safety Notes

⚠️ **IMPORTANT SAFETY WARNINGS:**
- Always ensure clear space around the robot (humanoid robots need more space)
- Keep emergency stop readily accessible
- Start with small distances and low speeds
- Monitor the robot during all operations
- Have a way to quickly power off the robot if needed
- The G1 is taller than quadrupeds - ensure adequate ceiling height
- Be cautious with humanoid gestures - ensure no one is too close

## Project Structure

```
server/
├── server.py          # FastAPI application for G1 control
├── pyproject.toml     # Project dependencies
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## Development

### Install dev dependencies:
```bash
uv pip install -e ".[dev]"
```

### Run tests:
```bash
pytest
```

### Code formatting with ruff:
```bash
ruff check .
ruff format .
```

## API Response Format

All endpoints return JSON responses in this format:

**Success:**
```json
{
  "status": "success",
  "message": "Operation completed",
  "result": 0  // SDK return code
}
```

**Error:**
```json
{
  "detail": "Error message"
}
```

## Contributing

When adding new G1 features:
1. Check the unitree_sdk2_python G1 examples
2. Add the endpoint to `server.py`
3. Update this README
4. Test thoroughly with the physical robot

## License

This project follows the same license as the unitree_sdk2_python package.
