@echo off
echo Starting MCP Server...
cd /d "%~dp0"
echo Starting server in background...
start "MCP Server" cmd /c "npm start"
echo Waiting 4 seconds for server to start...
timeout /t 4 /nobreak >nul
echo.
echo Testing /health endpoint:
curl -s http://localhost:5000/health
echo.
echo.
echo Testing /hello-world endpoint:
curl -s http://localhost:5000/hello-world
echo.
echo.
echo Testing MCP tools/list:
curl -s -X POST http://localhost:5000/mcp -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}"
echo.
pause
