#!/bin/bash
cd /home/z/my-project
while true; do
    if ! curl -s --connect-timeout 1 http://localhost:3000/ > /dev/null 2>&1; then
        echo "[$(date)] Server not responding on port 3000, starting..."
        PORT=3000 HOSTNAME="0.0.0.0" node .next/standalone/server.js &
        SERVER_PID=$!
        echo "[$(date)] Started server PID: $SERVER_PID"
        # Wait for server to die or be killed
        wait $SERVER_PID 2>/dev/null || true
        echo "[$(date)] Server process ended, restarting in 2s..."
        sleep 2
    else
        sleep 3
    fi
done
