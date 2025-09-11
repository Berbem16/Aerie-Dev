@echo off
echo Starting UAS Reporting Tool with Docker Compose...
echo.
echo This will start:
echo - PostgreSQL database on port 5432
echo - FastAPI backend on port 8000
echo - React frontend on port 3001
echo.
echo NOTE: If you get port conflicts, make sure to stop any existing services first
echo.
echo Press Ctrl+C to stop all services
echo.

docker-compose up --build 