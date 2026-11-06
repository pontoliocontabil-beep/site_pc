@echo off
setlocal
chcp 65001 >nul
title Publicar site e painel - PontoLio Contabil
cd /d "%~dp0"

if not exist "firebase.json" goto pasta_errada
if not exist "public\admin\admin.js" goto pasta_errada

where node >nul 2>nul
if errorlevel 1 goto sem_node

for /f "usebackq delims=" %%v in (`node -p "require('./package.json').version"`) do set VERSAO=%%v
echo.
echo ==============================================================
echo   Publicando a versao %VERSAO%
echo   Pasta: %CD%
echo ==============================================================
echo.

if exist "node_modules\.bin\firebase.cmd" goto login
echo Instalando as ferramentas - so na primeira vez, leva alguns minutos...
call npm install
if errorlevel 1 goto erro_instalar

:login
call npx firebase login
if errorlevel 1 goto erro_login

call npx firebase deploy --only hosting,firestore:rules
if errorlevel 1 goto erro_publicar

echo.
echo ==============================================================
echo   PRONTO! Versao %VERSAO% publicada.
echo   Site:   https://anacont-709cb.web.app
echo   Painel: https://anacont-709cb.web.app/admin/
echo   No rodape do painel deve aparecer: Versao %VERSAO%
echo ==============================================================
start "" "https://anacont-709cb.web.app/admin/"
pause
exit /b 0

:pasta_errada
echo [ERRO] Este arquivo precisa ficar na pasta do projeto, ao lado de firebase.json e da pasta public.
echo        Verifique se o zip nao foi extraido para uma pasta dentro de outra pasta.
pause
exit /b 1

:sem_node
echo [ERRO] O Node.js nao foi encontrado. Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
pause
exit /b 1

:erro_instalar
echo [ERRO] Nao foi possivel instalar as ferramentas. Verifique a internet - redes de empresa podem bloquear o download.
pause
exit /b 1

:erro_login
echo [ERRO] O login no Firebase nao foi concluido. Rode de novo e entre com a conta Google dona do projeto.
pause
exit /b 1

:erro_publicar
echo [ERRO] A publicacao falhou. Leia a mensagem acima e envie um print para o suporte.
pause
exit /b 1
