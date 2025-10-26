#!/bin/bash

# Start script for G1 robot server with proper CycloneDDS configuration

echo "🤖 Unitree G1 Robot Server"
echo "=========================="
echo ""

# Get the absolute path to the project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Set CycloneDDS environment variables
export CYCLONEDDS_HOME="$PROJECT_ROOT/cyclonedds/install"
export DYLD_LIBRARY_PATH="$CYCLONEDDS_HOME/lib:$DYLD_LIBRARY_PATH"

echo "✓ CYCLONEDDS_HOME: $CYCLONEDDS_HOME"
echo "✓ DYLD_LIBRARY_PATH: $DYLD_LIBRARY_PATH"
echo ""

# Check if network interface is set
if [ -z "$ROBOT_NETWORK_INTERFACE" ]; then
    echo "ℹ️  No ROBOT_NETWORK_INTERFACE set - using default"
    echo "   To specify: export ROBOT_NETWORK_INTERFACE=eth0"
else
    echo "✓ Using network interface: $ROBOT_NETWORK_INTERFACE"
fi

echo ""
echo "⚠️  WARNING: Ensure there are no obstacles around the robot!"
echo ""
echo "Starting server on http://0.0.0.0:8000"
echo "API docs will be available at http://localhost:8000/docs"
echo ""

# Run the server
cd "$SCRIPT_DIR"
python server.py

