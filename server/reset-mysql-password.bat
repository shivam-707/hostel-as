@echo off
:: ========================================================
:: AuraHostel - MySQL Root Password Reset Helper
:: Sets root password to: root
:: ========================================================

echo.
echo ========================================================
echo   Resetting MySQL 'root' password to 'root' ...
echo ========================================================
echo.

:: Check for administrative permissions
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    echo Please right-click this file and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

set "RESET_SQL=%TEMP%\mysql_reset_cmd.sql"
set "MYSQLD=C:\Program Files\MySQL\MySQL Server 8.1\bin\mysqld.exe"
set "MY_INI=C:\ProgramData\MySQL\MySQL Server 8.1\my.ini"

echo Creating SQL initialization script...
(
  echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
  echo CREATE USER IF NOT EXISTS 'root'@'%%' IDENTIFIED BY 'root';
  echo ALTER USER 'root'@'%%' IDENTIFIED BY 'root';
  echo GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
  echo GRANT ALL PRIVILEGES ON *.* TO 'root'@'%%' WITH GRANT OPTION;
  echo FLUSH PRIVILEGES;
) > "%RESET_SQL%"

echo Stopping MySQL81 service...
net stop MySQL81 >nul 2>&1

echo Applying new password 'root' to MySQL...
start /b "" "%MYSQLD%" --defaults-file="%MY_INI%" --init-file="%RESET_SQL%" >nul 2>&1

:: Wait 4 seconds for init-file execution
timeout /t 4 /nobreak >nul

echo Terminating temporary mysqld process...
taskkill /f /im mysqld.exe >nul 2>&1

echo Starting MySQL81 service...
net start MySQL81

del "%RESET_SQL%" >nul 2>&1

echo.
echo ========================================================
echo   SUCCESS! MySQL root password has been set to: root
echo ========================================================
echo.
echo Now your credentials in server\.env are:
echo   DB_USER=root
echo   DB_PASSWORD=root
echo.
pause
