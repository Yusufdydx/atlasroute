@echo off
cd /d "%~dp0"
echo Starting server...
node node_modules\tsx\dist\cli.mjs index.ts
