# ========================================================
# AuraHostel - MySQL Root Password Reset Script (PowerShell)
# Run in Administrator PowerShell
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Resetting MySQL 'root' password to 'root' ...         " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "`n[ERROR] Please run this PowerShell script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell -> 'Run as Administrator', then run this script.`n"
    Exit
}

$tempSql = Join-Path $env:TEMP "mysql_reset_cmd.sql"
$mysqld = "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysqld.exe"
$myIni = "C:\ProgramData\MySQL\MySQL Server 8.1\my.ini"

$sqlContent = @"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
ALTER USER 'root'@'%' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"@

Set-Content -Path $tempSql -Value $sqlContent -Encoding UTF8

Write-Host "1. Stopping MySQL81 Windows service..." -ForegroundColor Yellow
Stop-Service -Name "MySQL81" -Force -ErrorAction SilentlyContinue

Write-Host "2. Applying new password 'root' via mysqld..." -ForegroundColor Yellow
$proc = Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=`"$myIni`"", "--init-file=`"$tempSql`"" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 4

Write-Host "3. Stopping temporary mysqld process..." -ForegroundColor Yellow
Stop-Process -Name "mysqld" -Force -ErrorAction SilentlyContinue

Write-Host "4. Restarting MySQL81 service..." -ForegroundColor Yellow
Start-Service -Name "MySQL81"

Remove-Item -Path $tempSql -Force -ErrorAction SilentlyContinue

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  SUCCESS! MySQL root password has been set to: root    " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "`nYour new credentials are:"
Write-Host "  DB_USER=root" -ForegroundColor White
Write-Host "  DB_PASSWORD=root" -ForegroundColor White
Write-Host "`nYou can now set DB_PASSWORD=root in server\.env" -ForegroundColor Cyan
