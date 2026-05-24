@echo off
setlocal

set "JAVA_HOME=C:\Users\dhara\AppData\Local\Programs\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
set "MAVEN_HOME=%~dp0..\tools\maven"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

cd /d "%~dp0"
echo Starting with MySQL profile...
mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
pause
