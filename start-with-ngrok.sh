#!/bin/bash

echo "============================================================"
echo "Starting Backend with ngrok Tunnel"
echo "============================================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ERROR: ngrok is not installed"
    echo ""
    echo "Please install ngrok:"
    echo "  macOS: brew install ngrok/ngrok/ngrok"
    echo "  Linux: snap install ngrok"
    echo "  Or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "Step 1: Starting backend server..."
echo ""
cd backend
npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo ""
echo "Step 2: Starting ngrok tunnel..."
echo ""
echo "IMPORTANT: Copy the HTTPS URL from ngrok output"
echo "Example: https://abc123.ngrok-free.app"
echo ""
echo "Then update frontend/utils/network.ts with this URL"
echo ""

ngrok http 3000

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
