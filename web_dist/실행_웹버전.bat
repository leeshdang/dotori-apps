@echo off
chcp 65001 > nul
title Dotori Chess Learning (체스 학습 게임) - Web Launcher
echo ========================================================
echo  🌰 Dotori Chess Learning (체스 학습 게임) 웹 직접 실행기
echo ========================================================
echo.
echo 웹 브라우저를 열고 로컬 서버를 실행합니다...
echo (서버를 종료하려면 이 창을 닫으세요.)
echo.

start "" "http://localhost:5178"
npx --yes serve -s . -l 5178
if %errorlevel% neq 0 (
    python -m http.server 5178
)
pause
