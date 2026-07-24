@echo off
title Job-Inquisitor
color 0A

echo ===================================================
echo 🕵️‍♂️ Verificando dependencias do sistema...
echo ===================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [AVISO CRITICO]: O Node.js nao foi encontrado no seu computador! (Obrigatorio)
    set /p choice="Deseja instalar o Node.js automaticamente agora? (S/N): "
    if /i "%choice%"=="S" (
        echo Baixando e instalando o Node.js...
        winget install OpenJS.NodeJS -e --accept-package-agreements --accept-source-agreements
        echo [SUCESSO]: Node.js instalado!
        echo FECHE ESTA JANELA E ABRA NOVAMENTE PARA O WINDOWS RECONHECER O COMANDO.
        pause
        exit
    ) else (
        echo [ERRO]: Nao e possivel continuar sem o Node.js. Fechando...
        pause
        exit
    )
) else (
    echo [OK] Node.js detectado.
)

where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [AVISO]: A Inteligencia Artificial (Ollama) nao foi encontrada no sistema.
    echo O sistema funcionara no Modo Basico (Heuristico), mas voce perdera a capacidade semantica.
    set /p choice2="Deseja instalar a IA Ollama automaticamente agora? (S/N): "
    if /i "%choice2%"=="S" (
        echo Baixando e instalando o Ollama... (Pode demorar dependendo da internet)
        winget install Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
        echo [SUCESSO]: Ollama instalado! (Inicie-o pelo Menu Iniciar depois do setup)
        
        echo Baixando o modelo Llama 3.2 (Cérebro da IA - Isso pode demorar)...
        ollama pull llama3.2:3b
    )
) else (
    echo [OK] IA Ollama detectada.
    echo Garantindo que o modelo Llama 3.2 está baixado...
    ollama pull llama3.2:3b
)

echo.
echo Instalando dependencias do Job-Inquisitor...
call npm install --no-fund --no-audit

echo.
echo ===================================================
echo 🚀 Iniciando o Job-Inquisitor...
echo ===================================================
call npm start

pause

