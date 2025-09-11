@echo off
echo Cleaning up Docker services and ports...
echo.

echo Stopping any running containers...
docker-compose down

echo.
echo Checking for containers using ports 3000, 3001, 8000, 5432...
echo.

echo Port 3000:
netstat -ano | findstr :3000
echo.

echo Port 3001:
netstat -ano | findstr :3001
echo.

echo Port 8000:
netstat -ano | findstr :8000
echo.

echo Port 5432:
netstat -ano | findstr :5432
echo.

echo.
echo Cleanup complete. You can now run start.bat
pause 