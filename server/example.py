#!/usr/bin/env python3
"""
Minimal example to put G1 robot in damp mode

Usage:
    ./run_example.sh           # Use default network interface
    ./run_example.sh en7       # Specify network interface (e.g., en7)

Note: Use run_example.sh wrapper script which sets up CycloneDDS automatically!
"""
import sys
from pathlib import Path

# Add parent directory to path for unitree_sdk2py imports
sys.path.append(str(Path(__file__).parent.parent))

from unitree_sdk2py.core.channel import ChannelFactoryInitialize
from unitree_sdk2py.g1.loco.g1_loco_client import LocoClient

# Initialize communication (optionally pass network interface as argument)
if len(sys.argv) > 1:
    network_interface = sys.argv[1]
    print(f"Using network interface: {network_interface}")
    ChannelFactoryInitialize(0, network_interface)
else:
    print("Using default network interface")
    ChannelFactoryInitialize(0)

# Create client and connect
loco_client = LocoClient()
loco_client.SetTimeout(10.0)
loco_client.Init()

# Put robot in damp mode
print("Putting robot in damp mode...")
result = loco_client.Damp()
print(f"Result: {result}")
print("Robot is now in damp mode (motors relaxed)")
