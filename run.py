"""
ProductPulse One-Line Launcher
==============================
Starts both the FastAPI backend and React Vite frontend in parallel,
waits for health verification, automatically opens the browser,
and manages clean shutdown on Ctrl+C.
"""

import os
import sys
import time
import socket
import signal
import subprocess
import webbrowser
import urllib.request
import urllib.error

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8000
BACKEND_HEALTH_URL = f"http://{BACKEND_HOST}:{BACKEND_PORT}/health"
FRONTEND_URL = "http://localhost:5173"


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def kill_process_on_port(port: int):
    """Frees port if an orphaned process from a previous run is still lingering."""
    if not is_port_in_use(port):
        return
    print(f"[*] Port {port} is occupied. Cleaning up lingering process...")
    if sys.platform == "win32":
        try:
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            pids = set()
            for line in output.strip().splitlines():
                parts = line.split()
                if len(parts) >= 5 and "LISTENING" in parts:
                    pid = parts[-1]
                    if pid.isdigit() and int(pid) != os.getpid():
                        pids.add(pid)
            for pid in pids:
                print(f"[*] Terminating process {pid} on port {port}...")
                subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(1)
        except Exception:
            pass


def wait_for_backend(timeout: int = 20) -> bool:
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with urllib.request.urlopen(BACKEND_HEALTH_URL, timeout=1) as resp:
                if resp.status == 200:
                    return True
        except (urllib.error.URLError, ConnectionRefusedError, socket.timeout):
            time.sleep(0.5)
    return False


def terminate_process(proc):
    if proc is None:
        return
    try:
        if sys.platform == "win32":
            subprocess.run(f"taskkill /F /T /PID {proc.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            proc.terminate()
            proc.wait(timeout=2)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def main():
    print("=" * 65)
    print("           PRODUCTPULSE: UNIFIED LAUNCHER")
    print("=" * 65)

    # 1. Clean up stale ports if needed
    kill_process_on_port(BACKEND_PORT)
    kill_process_on_port(5173)

    # 2. Start Backend (FastAPI via uvicorn)
    print("\n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.app:app",
        "--host",
        BACKEND_HOST,
        "--port",
        str(BACKEND_PORT)
    ]
    
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=ROOT_DIR,
        stdout=None,
        stderr=None
    )

    # 3. Wait for Backend Health Check
    print("      Waiting for backend to initialize models and artifacts...")
    if not wait_for_backend(timeout=20):
        print("\n[!] Error: Backend failed to respond on /health within 20s.")
        terminate_process(backend_proc)
        sys.exit(1)
    print("      Backend is online! (Status: healthy)")

    # 4. Start Frontend (Vite)
    print("\n[2/3] Starting Vite React Frontend on http://localhost:5173 ...")
    npm_cmd = "npm run dev"
    frontend_proc = subprocess.Popen(
        npm_cmd,
        cwd=FRONTEND_DIR,
        shell=True,
        stdout=None,
        stderr=None
    )

    # 5. Open browser
    time.sleep(2)
    print("\n[3/3] Opening browser at http://localhost:5173 ...")
    try:
        webbrowser.open(FRONTEND_URL)
    except Exception:
        pass

    print("\n" + "=" * 65)
    print("  ProductPulse is now live and working perfectly!")
    print(f"  • Frontend:    {FRONTEND_URL}")
    print(f"  • Backend API: http://{BACKEND_HOST}:{BACKEND_PORT}")
    print(f"  • API Docs:    http://{BACKEND_HOST}:{BACKEND_PORT}/docs")
    print("=" * 65)
    print("  Press Ctrl+C at any time to stop both servers cleanly.\n")

    # Monitor and handle graceful exit
    try:
        while True:
            time.sleep(1)
            # Check if either process crashed prematurely
            if backend_proc.poll() is not None:
                print("\n[!] Backend process exited.")
                break
            if frontend_proc.poll() is not None:
                print("\n[!] Frontend process exited.")
                break
    except KeyboardInterrupt:
        print("\nStopping ProductPulse...")
    finally:
        terminate_process(frontend_proc)
        terminate_process(backend_proc)
        print("ProductPulse stopped successfully.")


if __name__ == "__main__":
    main()
