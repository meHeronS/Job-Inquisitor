# 🤖 Guia de Configuração da IA Local 100% Gratuita (Ollama - Job Inquisitor 🕵️‍♂️)

O **Job Inquisitor** utiliza o **Ollama**, uma solução open-source **100% GRATUITA, ILIMITADA e PRIVADA** para executar modelos de inteligência artificial diretamente na sua máquina local.

---

## 🔑 Por que 100% Gratuito?
- **Zero Custo de API:** Não precisa de cartão de crédito, chaves de API pagas ou assinaturas.
- **Sem Limites de Uso:** Você pode deixar rodando a noite toda analisando milhares de vagas sem pagar nada.
- **Privacidade Total:** Seus currículos e dados pessoais nunca saem do seu computador.
- **Leve para CPU/RAM:** Utiliza modelos super otimizados (1.5B e 3B) que rodam suavemente até em notebooks simples com 4GB a 8GB de RAM.

---

## 🚀 Como Instalar em 2 Minutos (Linux / Mac / Windows)

### 1. Instalar o Ollama (Linux Mint / Ubuntu)
Abra o seu terminal e rode o comando oficial:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Baixar o Modelo Leve Recomendado
Escolha uma das opções ultra-leves e gratuitas abaixo:

- **Opção 1 (Super Leve - Recomendada para Execução Noturna):**
  ```bash
  ollama run qwen2.5:1.5b
  ```
- **Opção 2 (Llama 3.2 3B Meta):**
  ```bash
  ollama run llama3.2:3b
  ```

---

## ⚡ Como o Job Inquisitor se Conecta

Assim que o Ollama é iniciado, ele roda um servidor local na porta `11434` (`http://localhost:11434`). O **Job Inquisitor** se conecta automaticamente nesta porta local de forma transparente!
