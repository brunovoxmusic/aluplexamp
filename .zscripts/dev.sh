#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step_start() {
    local step_name="$1"
    echo "=========================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting: $step_name"
    echo "=========================================="
    export STEP_START_TIME
    STEP_START_TIME=$(date +%s)
}

log_step_end() {
    local step_name="${1:-Unknown step}"
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - STEP_START_TIME))
    echo "=========================================="
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Completed: $step_name"
    echo "[LOG] Step: $step_name | Duration: ${duration}s"
    echo "=========================================="
    echo ""
}

start_mini_services() {
    local mini_services_dir="$PROJECT_DIR/mini-services"
    local started_count=0

    log_step_start "Starting mini-services"
    if [ ! -d "$mini_services_dir" ]; then
        echo "Mini-services directory not found, skipping..."
        log_step_end "Starting mini-services"
        return 0
    fi

    echo "Found mini-services directory, scanning for sub-services..."

    for service_dir in "$mini_services_dir"/*; do
        if [ ! -d "$service_dir" ]; then
            continue
        fi

        local service_name
        service_name=$(basename "$service_dir")
        echo "Checking service: $service_name"

        if [ ! -f "$service_dir/package.json" ]; then
            echo "[$service_name] No package.json found, skipping..."
            continue
        fi

        if ! grep -q '"dev"' "$service_dir/package.json"; then
            echo "[$service_name] No dev script found, skipping..."
            continue
        fi

        # Skip our own aluplex-server since daemon handles it
        if [ "$service_name" = "aluplex-server" ]; then
            echo "[$service_name] Skipping (handled by daemon)"
            continue
        fi

        echo "Starting $service_name in background..."
        (
                cd "$service_dir"
                echo "[$service_name] Installing dependencies..."
                bun install
                echo "[$service_name] Running bun run dev..."
                exec bun run dev
        ) >"$PROJECT_DIR/.zscripts/mini-service-${service_name}.log" 2>&1 &

        local service_pid=$!
        echo "[$service_name] Started in background (PID: $service_pid)"
        disown "$service_pid" 2>/dev/null || true
        started_count=$((started_count + 1))
    done

    echo "Mini-services startup completed. Started $started_count service(s)."
    log_step_end "Starting mini-services"
}

wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local max_attempts="${4:-60}"
    local attempt=1

    echo "Waiting for $service_name to be ready on $host:$port..."

    while [ "$attempt" -le "$max_attempts" ]; do
        if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
                echo "$service_name is ready!"
                return 0
        fi

        echo "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
        sleep 1
        attempt=$((attempt + 1))
    done

    echo "ERROR: $service_name failed to start within $max_attempts seconds"
    return 1
}

cd "$PROJECT_DIR"

# ========== Step 1: Install dependencies ==========
log_step_start "bun install"
echo "[BUN] Installing dependencies..."
bun install
log_step_end "bun install"

# ========== Step 2: Setup database ==========
log_step_start "bun run db:push"
echo "[BUN] Setting up database..."
bun run db:push
log_step_end "bun run db:push"

# ========== Step 3: Build production app ==========
log_step_start "Production build"
echo "[BUILD] Running next build..."
NODE_OPTIONS="--max-old-space-size=4096" npx next build
echo "[BUILD] Copying static assets..."
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
cp -r public .next/standalone/ 2>/dev/null || true
log_step_end "Production build"

# ========== Step 4: Ensure daemon binary exists ==========
log_step_start "Daemon setup"
if [ ! -f "$PROJECT_DIR/daemonize" ]; then
    echo "[DAEMON] Compiling daemonize binary..."
    gcc -o "$PROJECT_DIR/daemonize" /tmp/daemonize.c 2>/dev/null || \
    cat > /tmp/daemonize.c << 'C_EOF'
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
int main() {
    pid_t pid = fork();
    if (pid > 0) _exit(0);
    if (pid < 0) return 1;
    setsid();
    pid = fork();
    if (pid > 0) _exit(0);
    if (pid < 0) return 1;
    chdir("/home/z/my-project");
    umask(0);
    close(0); close(1); close(2);
    open("/dev/null", O_RDONLY);
    open("/home/z/my-project/server.log", O_WRONLY|O_CREAT|O_APPEND, 0644);
    open("/home/z/my-project/server.log", O_WRONLY|O_CREAT|O_APPEND, 0644);
    setenv("PORT", "3000", 1);
    setenv("HOSTNAME", "0.0.0.0", 1);
    setenv("NODE_ENV", "production", 1);
    char *a[] = {"node", ".next/standalone/server.js", NULL};
    execvp("node", a);
    return 1;
}
C_EOF
    gcc -o "$PROJECT_DIR/daemonize" /tmp/daemonize.c
fi
echo "[DAEMON] Binary ready: $PROJECT_DIR/daemonize"
log_step_end "Daemon setup"

# ========== Step 5: Start mini-services ==========
start_mini_services

# ========== Step 6: Start production server via daemon ==========
log_step_start "Starting production server via daemon"
echo "[DAEMON] Launching server (will be adopted by PID 1)..."
"$PROJECT_DIR/daemonize"
echo "[DAEMON] Parent exited. Grandchild should be running..."

# Wait for server
sleep 3
if curl -s --connect-timeout 2 http://localhost:3000/ >/dev/null 2>&1; then
    echo "[DAEMON] Server is running!"
else
    echo "[DAEMON] WARNING: Server not responding yet, waiting..."
    wait_for_service "localhost" "3000" "Next.js production server" 30
fi

log_step_end "Starting production server via daemon"

echo "=========================================="
echo "[DONE] ALUPLEXamp server started via daemon"
echo "[DONE] Server process adopted by PID 1 (tini)"
echo "[DONE] Server will persist independently"
echo "=========================================="

# Keep script alive briefly for start.sh health check
sleep 2
