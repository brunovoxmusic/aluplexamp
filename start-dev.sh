#!/bin/bash
cd /home/z/my-project

while true; do
  # Check if port 3000 is already listening
  if ss -tlnp | rg -q ":3000 "; then
    sleep 3
    continue
  fi
  
  # Clean and start
  rm -rf .next
  NODE_OPTIONS="--max-old-space-size=768" bun run dev >> /home/z/my-project/dev.log 2>&1 &
  DEV_PID=$!
  echo "$(date): Started dev server PID=$DEV_PID" >> /home/z/my-project/dev.log
  
  # Wait for it to be ready
  for i in $(seq 1 15); do
    sleep 2
    if ! kill -0 $DEV_PID 2>/dev/null; then
      echo "$(date): Process $DEV_PID died, restarting..." >> /home/z/my-project/dev.log
      break
    fi
    if ss -tlnp | rg -q ":3000 "; then
      echo "$(date): Port 3000 ready" >> /home/z/my-project/dev.log
      break
    fi
  done
  
  sleep 3
done
