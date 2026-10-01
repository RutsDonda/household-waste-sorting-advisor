"""
Household Waste Sorting Advisor - Full System Launcher
Starts the FastAPI application and serves both the Backend REST APIs and
the built React 19 Frontend Dashboard on http://localhost:8000.
"""

import os
import sys
import subprocess
import webbrowser
from pathlib import Path

def main():
    root_dir = Path(__file__).resolve().parent
    os.chdir(root_dir)

    print("=" * 65)
    print("  Household Waste Sorting Advisor - Big Data & AI System")
    print("=" * 65)
    print("1. Checking Environment & Database...")

    # Check if database has been seeded
    db_store = root_dir / "data" / "db_store.json"
    if not db_store.exists():
        print("   Database not detected. Running initial data seeder...")
        subprocess.run([sys.executable, "-m", "backend.scripts.seed_data"], check=True)

    print("2. Launching FastAPI Server on http://localhost:8000 ...")
    print("   • API Swagger Docs:   http://localhost:8000/docs")
    print("   • Full-Stack UI:      http://localhost:8000")
    print("   • Vite Dev Server:    http://localhost:5173 (if running 'npm run dev')")
    print("-" * 65)

    try:
        import uvicorn
        uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\nShutting down Household Waste Sorting Advisor.")

if __name__ == "__main__":
    main()
