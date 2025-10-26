#!/bin/bash

# Wrapper script to run example.py with proper CycloneDDS setup

# Get the absolute path to the project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Set CycloneDDS environment variables
export CYCLONEDDS_HOME="$PROJECT_ROOT/cyclonedds/install"
export DYLD_LIBRARY_PATH="$CYCLONEDDS_HOME/lib:$DYLD_LIBRARY_PATH"

echo "🤖 Running G1 Damp Mode Example"
echo "================================"
echo ""
echo "✓ CYCLONEDDS_HOME: $CYCLONEDDS_HOME"
echo ""

# Run the example
cd "$SCRIPT_DIR"
python example.py "$@"

