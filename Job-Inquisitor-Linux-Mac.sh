#!/bin/bash
echo "==================================================="
echo "🕵️‍♂️ Verificando dependencias do sistema (Linux/macOS)..."
echo "==================================================="
echo ""

# Verificar Node
if ! command -v node &> /dev/null; then
    echo "[AVISO CRITICO]: Node.js nao foi encontrado no seu computador! (Obrigatorio)"
    read -p "Deseja tentar instalar o Node.js via apt (Ubuntu/Debian) ou brew (macOS)? (S/N): " choice
    if [[ "$choice" == "S" || "$choice" == "s" ]]; then
        if command -v apt-get &> /dev/null; then
            echo "Instalando via APT..."
            sudo apt-get update && sudo apt-get install -y nodejs npm
        elif command -v brew &> /dev/null; then
            echo "Instalando via Homebrew..."
            brew install node
        else
            echo "[ERRO] Gerenciador de pacotes nao suportado automaticamente. Instale o Node.js manualmente."
            exit 1
        fi
    else
        echo "[ERRO] Nao e possivel continuar sem o Node.js. Fechando..."
        exit 1
    fi
else
    echo "[OK] Node.js detectado."
fi

# Verificar Ollama
if ! command -v ollama &> /dev/null; then
    echo ""
    echo "[AVISO]: A Inteligencia Artificial (Ollama) nao foi encontrada."
    echo "O sistema funcionara no Modo Basico (Heuristico), sem a capacidade semantica."
    read -p "Deseja instalar a IA Ollama automaticamente agora? (S/N): " choice2
    if [[ "$choice2" == "S" || "$choice2" == "s" ]]; then
        echo "Baixando e instalando o Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
        echo "[SUCESSO]: Ollama instalado!"
        
        echo "Baixando o modelo Llama 3.2 (Cérebro da IA - Isso pode demorar)..."
        ollama pull llama3.2:3b
    fi
else
    echo "[OK] IA Ollama detectada."
    echo "Garantindo que o modelo Llama 3.2 está baixado..."
    ollama pull llama3.2:3b
fi

echo ""
echo "Instalando dependencias do Job-Inquisitor (npm install)..."
npm install --no-fund --no-audit

echo ""
echo "==================================================="
echo "🚀 Iniciando o Job-Inquisitor..."
echo "==================================================="
npm start

