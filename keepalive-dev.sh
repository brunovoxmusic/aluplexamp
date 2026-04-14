#!/bin/bash
# Persistent dev server for ALUPLEXamp
cd /home/z/my-project
rm -rf .next

while true; do
  echo "[$(date)] Starting dev server..."
  NODE_OPTIONS="--max-old-space-size=1024" bun run dev 2>&1
  echo "[$(date)] Server exited, restarting in 3s..."
  sleep 3
done
