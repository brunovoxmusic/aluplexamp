#!/bin/bash
# Persistent dev server for ALUPLEXamp
cd /home/z/my-project

while true; do
  # Check if port 3000 is already listening
  if ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    sleep 5
    continue
  fi

  echo "[$(date)] Starting dev server..."
  NODE_OPTIONS="--max-old-space-size=1024" npx next dev --port 3000 >> /home/z/my-project/dev.log 2>&1 &
  DEV_PID=$!
  echo "[$(date)] Started dev server PID=$DEV_PID" >> /home/z/my-project/dev.log

  # Wait for it to be ready or die
  for i in $(seq 1 30); do
    sleep 2
    if ! kill -0 $DEV_PID 2>/dev/null; then
      echo "[$(date)] Process $DEV_PID died, restarting..." >> /home/z/my-project/dev.log
      break
    fi
    if ss -tlnp 2>/dev/null | grep -q ":3000 "; then
      echo "[$(date)] Port 3000 ready (PID=$DEV_PID)" >> /home/z/my-project/dev.log
      break
    fi
  done

  # Wait for the process to exit
  wait $DEV_PID 2>/dev/null
  echo "[$(date)] Server exited, restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
