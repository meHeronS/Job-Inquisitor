# Job Inquisitor 🕵️‍♂️

> **Investigador & Copiloto de Vagas Automático Universal** - Ferramenta open-source universal, **100% GRATUITA**, compatível com **Linux, Windows e macOS**, com relatórios ultra-enxutos otimizados para aplicação em massa (50+ candidaturas/dia), criptografia militar PBKDF2 + AES-256-GCM com chave derivada de hardware, baixo consumo de RAM/CPU (< 1.2 GB RAM), suporte a Google One-Tap e Microsoft Outlook OAuth 2.0, busca em 12 portais + "Trabalhe Conosco" direto para **qualquer área profissional**.
> 
> **Criado por:** Heron Silva ([@meherons](https://github.com/meherons))

---

## 🚀 Guia Passo a Passo da Primeira Execução (Quickstart)

### 1️⃣ Passo 1: Colocar seu Currículo na Pasta
Copie o seu currículo em PDF para a pasta privada:
```bash
user_data/resumes/
```
*(Se tiver uma carta de apresentação em PDF, coloque em `user_data/letters/`)*

### 2️⃣ Passo 2: Instalar as Dependências (Primeira vez)
No terminal da pasta do projeto, rode:
```bash
npm install
```

### 3️⃣ Passo 3: Organizar as Pastas e Rodar os Testes
Garante que todas as pastas privadas estão criadas e os 15 módulos operacionais:
```bash
npm run clean-dirs
npm test
```

### 4️⃣ Passo 4: Opcional - Ativar a IA Local 100% Gratuita (Ollama)
Se quiser relatórios gerados por IA Local (ou pule este passo para usar o motor nativo gratuito):
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run qwen2.5:1.5b
```

### 5️⃣ Passo 5: Iniciar o Job Inquisitor 🕵️‍♂️
Rode o comando no seu terminal para abrir o copiloto interativo:
```bash
npm start
```

---

## 🕵️‍♂️ Por que "Job Inquisitor"?

O **Job Inquisitor** investiga e "interroga" o mercado de trabalho por você:

1. **Investiga Anúncios de Vaga:** Analisa os requisitos, detecta vagas fantasma (*Ghost Jobs*) e identifica o gatilho perfeito para chamar a atenção do recrutador.
2. **Calcula a Pretensão Salarial Confiável:** Cruza dados de mercado e aplica a regra CLT x PJ (1.55x) com limites realistas de triagem.
3. **Preenche Formulários sem Alucinação:** Automatiza o preenchimento de campos repetitivos e ajuda você a revisar respostas discursivas em segundos.

---

## ⚡ Relatórios Ultra-Enxutos (Otimizados para 50+ Candidaturas/Dia)

```text
🎯 [85% Match] Candidatar | ✅ Vaga Legítima Mapeada
💡 Gatilho RH: Experiência direta aplicável para a posição na empresa.
💰 Pretensão Salarial: CLT: R$ 4.500 - R$ 7.500 | PJ: R$ 6.750 - R$ 11.250
```

---

## 📁 Estrutura de Diretórios 100% Limpa e Intuitiva

```
Job-Inquisitor/
├── user_data/                # 🔒 [GIT-IGNORED] DADOS PRIVADOS DO USUÁRIO
│   ├── resumes/              # Currículos reais do usuário em PDF
│   ├── letters/              # Cartas de apresentação em PDF
│   └── sessions/             # Tokens OAuth e sessão do navegador
├── data/                     # 🗄️ [GIT-IGNORED] BANCO DE DADOS & RELATÓRIOS DO SISTEMA
│   ├── db/                   # Arquivo do Banco Local (job_inquisitor_db.json)
│   └── reports/              # Relatório exportado da Lista VIP (LISTA_VIP_VAGAS.md)
├── docs/                     # 📖 DOCUMENTAÇÃO PÚBLICA DO REPOSITÓRIO GITHUB
├── logs/                     # 📝 Logs de auditoria da varredura (app.log)
├── tests/                    # 🧪 Suíte de testes unitários automatizados (health.test.js)
└── src/                      # 💻 CÓDIGO-FONTE LIMPO DA APLICAÇÃO (SOLID / ESM)
```
