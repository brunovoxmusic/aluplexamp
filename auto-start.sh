#!/bin/bash
# Auto-start: if port 3000 is down, use the C daemon to start server
if ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "[$(date)] Server not running on port 3000, starting via daemon..."
    /home/z/my-project/daemonize
    sleep 3
    if ss -tlnp 2>/dev/null | grep -q ":3000 "; then
        echo "[$(date)] Server started successfully via daemon"
    else
        echo "[$(date)] ERROR: Server failed to start"
    fi
else
    echo "[$(date)] Server already running on port 3000"
fi
