# Job Inquisitor 🕵️‍♂️

> **Investigador & Copiloto de Vagas Automático Universal** - Ferramenta open-source universal, **100% GRATUITA**, compatível com **Linux, Windows e macOS**, com relatórios ultra-enxutos otimizados para aplicação em massa (50+ candidaturas/dia), criptografia militar PBKDF2 + AES-256-GCM com chave derivada de hardware, baixo consumo de RAM/CPU (< 1.2 GB RAM), suporte a Google One-Tap e Microsoft Outlook OAuth 2.0, busca em 12 portais + "Trabalhe Conosco" direto para **qualquer área profissional**.
> 
> **Criado por:** Heron Silva ([@meherons](https://github.com/meherons)) | **Versão:** `v1.0.1` ([CHANGELOG](CHANGELOG.md)) | **Licença:** [MIT](LICENSE) | **Arquitetura SDLC:** [ARCHITECTURE_SDLC.md](docs/ARCHITECTURE_SDLC.md)

---

## ⚖️ Conformidade Legal, Ética e LGPD (Compliance)

O **Job Inquisitor 🕵️‍♂️** foi projetado seguindo rigorosamente as diretrizes da **LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018)** e as melhores práticas éticas da indústria de software:

1. **Privacidade Absoluta (LGPD Compliance):** Nenhum dado pessoal do candidato (currículos, e-mails, histórico salarial ou tokens) é enviado para servidores remotos na nuvem. Todos os dados permanecem mantidos **100% no dispositivo local do usuário** e criptografados em repouso com **AES-256-GCM**.
2. **Raspagem Ética e Transparente (Ethical Web Scraping):** O robô consulta exclusivamente **anúncios públicos de vagas** disponibilizados abertamente pelas empresas para atração de talentos. Operações de varredura executam com controle de vazão no BullMQ e delays humanizados (3s a 8s), respeitando os servidores das plataformas.
3. **Isenção de Responsabilidade Open-Source (MIT License):** O software é distribuído sob a licença open-source MIT ("AS IS"), sem garantias implícitas, garantindo respaldo jurídico ao autor e desenvolvedores.

---

## 🏛️ Mapeamento de Disciplinas de Ciência da Computação & SDLC

| Disciplina da Ciência da Computação | Onde se Aplica no Projeto | Tecnologias / Conceitos Utilizados |
| :--- | :--- | :--- |
| **🔍 Recuperação de Informação (IR)** | `ScrapingService` & `CompanyCareerPageService` | Web Scraping RPA (Playwright), Parsing de PDF (`pdf-parse`), Resolução de Redirects (Eightfold/Lever) |
| **⚡ Sistemas Distribuídos** | `JobQueueManager` & `redis.js` | Arquitetura Orientada a Eventos / Filas Assíncronas BullMQ + Redis |
| **🧩 Arquitetura Modular & SOLID** | `src/services/` & `JobController` | Camadas Desacopladas, Responsabilidade Única (SRP), Injeção de Dependências, Dual DB Engine |
| **🔒 Segurança & DevSecOps** | `SecurityCryptoService` | Criptografia Militar AES-256-GCM, PBKDF2 HMAC-SHA256, Permissões `chmod 600`, OAuth 2.0 (`gmail.readonly`) |
| **🧪 QA, Testes & TDD** | `tests/health.test.js` | Testes Unitários Nativos Automatizados, Asserção de Contratos e Autocriação Defensiva |
| **🎨 Interação Homem-Computador (IHC)**| `src/cli/` & `FormAutofillService` | Interface CLI Human-in-the-Loop, Relatórios Ultra-Enxutos (3 linhas), Preenchimento Assistido sem Alucinação |
| **📊 Métricas & Governança (PO)** | `PipelineMetricsService` | Métricas de Funil de Conversão (`applied`, `interview`, `rejected`), Benchmarks Salariais (CLT x PJ 1.55x) |

---

## 🤖 Transparência & Engenharia Pareada com IA (AI-Assisted Engineering)

> *Este projeto foi arquitetado e desenvolvido através de **Engenharia Pareada com Inteligência Artificial (Agentic AI Coding)** em colaboração com Antigravity (Google DeepMind Team).*
> 
> A solução combina princípios rígidos de **Engenharia de Software (Clean Code, SOLID, TDD, ES Modules, Criptografia AES-256-GCM em Repouso)** com o poder de **Modelos de Linguagem Locais (Ollama)** e **RPA com Playwright**.

---

## 🚀 Guia Passo a Passo da Primeira Execução (Quickstart)

### 1️⃣ Passo 1: Adicionar seu Currículo
Copie seu currículo em PDF para a pasta privada do projeto:
```bash
user_data/resumes/
```
*(Se tiver uma carta de apresentação em PDF, coloque em `user_data/letters/`)*

### 2️⃣ Passo 2: Instalar Dependências (Primeira vez)
No terminal da pasta do projeto, rode:
```bash
npm install
```

### 3️⃣ Passo 3: Garantir Estrutura de Pastas e Testes
Garante que todas as pastas privadas estão ativas e os 15 módulos validados:
```bash
npm run clean-dirs
npm test
```

### 4️⃣ Passo 4: Opcional - Ativar IA Local Gratuita (Ollama)
Se quiser relatórios gerados por IA Local (ou pule para usar o motor nativo grátis):
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run qwen2.5:1.5b
```

### 5️⃣ Passo 5: Iniciar o Job Inquisitor 🕵️‍♂️
Rode o comando no seu terminal para abrir a interface do copiloto:
```bash
npm start
```

---

## 🌐 Os 12 Portais Alvo & Busca Direta em "Trabalhe Conosco"

O **Job Inquisitor** varre 12 grandes agregadores de vagas e descobre autonomamente as empresas líderes do seu setor:

1. **LinkedIn Jobs** (Nacional & Internacional em USD/EUR)
2. **Gupy** (`portal.gupy.io`)
3. **Solides Jobs** (`portal.solides.com.br`)
4. **Vagas.com** (`vagas.com.br`)
5. **InfoJobs** (`infojobs.com.br`)
6. **99Jobs** (`99jobs.com`)
7. **Glassdoor Brasil** (`glassdoor.com.br`)
8. **Catho** (`catho.com.br`)
9. **Greenhouse ATS** (`boards.greenhouse.io`)
10. **Lever ATS** (`jobs.lever.co`)
11. **Workday ATS** (`myworkdayjobs.com`)
12. **RemoteOK / Remotive** (Internacional Remoto)

---

## 📊 Relatório Ultra-Enxuto para Alta Escala (3 Linhas)

O relatório gerado no terminal e salvo no arquivo `data/reports/LISTA_VIP_VAGAS.md`:

```text
🎯 [85% Match] Candidatar | ✅ Vaga Legítima Mapeada
💡 Gatilho RH: Experiência direta aplicável para a posição de Analista na empresa.
💰 Pretensão Salarial: CLT: R$ 4.500 - R$ 7.500 | PJ: R$ 6.750 - R$ 11.250
```

---

## 📁 Estrutura do Repositório 100% Limpa

```
Job-Inquisitor/
├── user_data/                # 🔒 [GIT-IGNORED] DADOS PRIVADOS DO USUÁRIO
│   ├── resumes/              # Seus currículos reais em PDF
│   ├── letters/              # Cartas de apresentação em PDF
│   └── sessions/             # Tokens OAuth e sessão do navegador (session_state.json)
├── data/                     # 🗄️ [GIT-IGNORED] BANCO DE DADOS & RELATÓRIOS DO SISTEMA
│   ├── db/                   # Arquivo do Banco Local (job_inquisitor_db.json)
│   └── reports/              # Relatório exportado da Lista VIP (LISTA_VIP_VAGAS.md)
├── docs/                     # 📖 DOCUMENTAÇÃO PÚBLICA DO REPOSITÓRIO GITHUB
├── logs/                     # 📝 [GIT-IGNORED] Logs de auditoria da varredura (app.log)
├── tests/                    # 🧪 Suíte de testes unitários automatizados (health.test.js)
├── CITATION.cff              # 📌 Arquivo Padrão de Citação no GitHub
├── LICENSE                   # ⚖️ Licença Open-Source MIT com Direitos de Autoria Heron Silva
└── src/                      # 💻 CÓDIGO-FONTE LIMPO DA APLICAÇÃO (SOLID / ESM)
```

---

## 📄 Licença e Direitos Autorais

Criado por **Heron Silva** ([@meherons](https://github.com/meherons)) sob a licença open-source [MIT](LICENSE).
