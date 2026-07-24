# Job Inquisitor 🕵️‍♂️

<div align="center">
  <img src="docs/logo.png" alt="Job Inquisitor Logo" width="300"/>
</div>

```text
      _       _       ___                  _     _ _
     | | ___ | |__   |_ _|_ __   __ _ _   _(_)___(_) |_ ___  __
  _  | |/ _ \| '_ \   | || '_ \ / _` | | | | / __| | __/ _ \| '__|
 | |_| | (_) | |_) |  | || | | | (_| | |_| | \__ \ | || (_) | |
  \___/ \___/|_.__/  |___|_| |_|\__, |\__,_|_|___/_|\__\___/|_|
                                   |_|
     .----.
    /  _   \   Copiloto de Vagas Automático
   |  ( )   |  "Buscando as melhores oportunidades..."
    \      /
     '----'
       \ \
        \_\
```

> **Investigador & Copiloto de Vagas Automático Universal** - Ferramenta open-source universal, **100% GRATUITA**, compatível com **Linux, Windows e macOS**, com relatórios ultra-enxutos otimizados para aplicação em massa (50+ candidaturas/dia), criptografia militar PBKDF2 + AES-256-GCM com chave derivada de hardware, baixo consumo de RAM/CPU (< 1.2 GB RAM), suporte a Google One-Tap e Microsoft Outlook OAuth 2.0, busca em 12 portais + "Trabalhe Conosco" direto para **qualquer área profissional**.
> 
> **Criado por:** Heron Silva ([@meherons](https://github.com/meherons)) | **Versão:** `v1.0.3` ([CHANGELOG](CHANGELOG.md)) | **Licença:** [MIT](LICENSE) | **Arquitetura SDLC:** [architecture-sdlc.md](docs/architecture-sdlc.md)

---

## Principais Recursos e Diferenciais Técnicos

Além da raspagem e automação tradicionais, o Job Inquisitor implementa um ciclo de vida completo para o candidato através de ferramentas integradas:

- 🧠 **Análise Semântica (LLM Local):** Integração com modelos locais (ex: Ollama) para interpretar o contexto de vagas. O motor avalia o alinhamento de perfil e identifica culturas organizacionais tóxicas (baseado em red flags textuais).
- 🗂️ **Rastreamento de Candidaturas (ATS Local):** Persistência automatizada do ciclo de vida das candidaturas (`data/applications.json`). O sistema sincroniza o status cruzando respostas recebidas por e-mail.
- ☢️ **Sistema de Quarentena de Falsos Positivos:** Vagas bloqueadas pelos filtros de segurança são alocadas em uma Quarentena que permite revisão e anulação (override) humana via CLI.
- 💬 **Assistente de Formulários (CLI Copilot):** Módulo interativo no terminal (Chat) que auxilia no preenchimento manual de plataformas complexas. A IA utiliza os dados extraídos do currículo e o tom de voz identificado para formular respostas personalizadas.
- 🩻 **Geração de Perfil de Candidato Estruturado:** Processamento de currículos em PDF para gerar resumos de 5 comprimentos distintos e sugerir otimizações de formato ATS (`atsImprovements`).

---

## 🏛️ Fundamentação Técnica & Disciplinas de Ciência da Computação

O **Job Inquisitor 🕵️‍♂️** possui um guia completo de arquitetura detalhando **onde, como e por que** cada grande disciplina da Ciência da Computação foi empregada. Veja o documento em [docs/architecture-sdlc.md](docs/architecture-sdlc.md).

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

## 🤝 Como Contribuir

O **Job Inquisitor** é um projeto mantido com padrões estritos de arquitetura de software. Se você é um desenvolvedor e quer nos ajudar a melhorar o ecossistema (seja com integrações de novos portais, melhorias na IA ou correções de bugs), leia o nosso **[Guia de Contribuição (CONTRIBUTING.md)](CONTRIBUTING.md)** antes de abrir um Pull Request.

---

## ⚖️ Conformidade Legal, Ética e LGPD (Compliance)

1. **Privacidade Absoluta (LGPD Compliance - Lei 13.709/2018):** Nenhum dado pessoal do candidato é enviado para a nuvem. Todos os dados permanecem **100% no dispositivo local do usuário** e criptografados em repouso.
2. **Raspagem Ética:** A varredura consulta exclusivamente **anúncios públicos de vagas**, utilizando controle de vazão no BullMQ e delays humanizados (3s a 8s).
3. **Isenção de Responsabilidade Open-Source:** Software sob licença MIT ("AS IS"), respaldando o autor e colaboradores.

---

## 🚀 Guia de Instalação Rápida (1-Click Bootstrapper)

O Job Inquisitor foi desenhado para ser acessível a qualquer usuário final. Todo o processo de instalação do **Node.js**, **Bibliotecas NPM** e do **Motor Semântico de IA (Ollama)** foi 100% automatizado em scripts nativos.

### 💻 Para usuários de Windows
1. Baixe o repositório e extraia a pasta.
2. Dê um duplo clique no arquivo **`Job-Inquisitor-Windows.bat`**.
3. O script verificará as dependências, instalará tudo automaticamente via *Winget* (Nativo do Windows), **baixará o modelo oficial de IA (Llama 3.2)** e inicializará o ecossistema na sua tela.

### 🐧🍎 Para usuários de Linux e macOS
1. Abra seu terminal na pasta do projeto.
2. Dê permissão de execução para o instalador:
   ```bash
   chmod +x Job-Inquisitor-Linux-Mac.sh
   ```
3. Execute o inicializador:
   ```bash
   ./Job-Inquisitor-Linux-Mac.sh
   ```
4. O script instalará o Node.js (`apt`/`brew`), o Ollama (`curl`), **baixará o modelo oficial de IA (Llama 3.2)** e fará o boot automático do sistema.

*(Para engenheiros de software que já possuem o Node.js e o Ollama configurados localmente: basta rodar `ollama pull llama3.2:3b` para garantir o modelo, e depois utilizar o fluxo tradicional `npm install` seguido de `npm start`).*

---

## 💻 Requisitos Mínimos (Otimizado para Escritório)

O motor de Inteligência Artificial do Job Inquisitor foi explicitamente reescrito e otimizado na camada da API (Modo de Baixo Consumo) para operar de forma segura em computadores de entrada ou hardwares legados, sem congelar o sistema operacional ou superaquecer os componentes físicos.

- **Processador:** Qualquer CPU (Intel Celeron, Core i3 antigo, Pentium). O sistema força o uso de **apenas 1 Thread (Núcleo)** do processador para IA, mantendo o restante da sua máquina totalmente livre para você continuar trabalhando ou assistindo Netflix sem travamentos.
- **Placa de Vídeo (GPU):** Nenhuma necessária. O sistema desabilita o uso de GPU ativamente para evitar mineração de hardware em notebooks de trabalho.
- **Memória RAM:** 4 GB. O sistema mastiga documentos usando uma arquitetura *Map-Reduce (Chunking)*. Ao invés de tentar ler tudo de uma vez e estourar a memória RAM, ele quebra os dados em pedaços microscópicos de 5000 caracteres, consumindo ridículos ~500MB a 1GB de RAM durante a geração.

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

## 📁 Estrutura do Repositório 100% Limpa

```
Job-Inquisitor/
├── user_data/                # 🔒 [GIT-IGNORED] DADOS PRIVADOS DO USUÁRIO
│   ├── resumes/              # Seus currículos reais em PDF
│   ├── letters/              # Cartas de apresentação em PDF
│   ├── sessions/             # Tokens OAuth e sessão do navegador (session_state.json)
│   ├── profile.json          # Clone digital 360º do seu perfil gerado pela IA
│   └── GIT_BRANCHING_GUIDE.md# 🌿 Seu Guia de Estudo Local de Branches
├── data/                     # 🗄️ [GIT-IGNORED] BANCO DE DADOS & RELATÓRIOS DO SISTEMA
│   ├── db/                   # Arquivo do Banco Local legado
│   ├── applications.json     # Banco de Dados Kanban do ATS (Seu Trello de Vagas)
│   └── reports/              # Relatório exportado da Lista VIP (LISTA_VIP_VAGAS.md)
├── docs/                     # 📖 DOCUMENTAÇÃO PÚBLICA DO REPOSITÓRIO GITHUB
│   ├── architecture-sdlc.md  # 🏛️ Guia Técnico de Arquitetura & Disciplinas da Ciência da Computação
│   ├── ollama-guide.md       # Guia da IA Local 100% Gratuita (Ollama)
│   └── resume-template.md    # Modelo público de currículo de exemplo
├── logs/                     # 📝 [GIT-IGNORED] Logs de auditoria da varredura (app.log)
├── tests/                    # 🧪 Suíte de testes unitários automatizados (health.test.js)
├── CITATION.cff              # 📌 Arquivo Padrão de Citação no GitHub
├── LICENSE                   # ⚖️ Licença Open-Source MIT com Direitos de Autoria Heron Silva
└── src/                      # 💻 CÓDIGO-FONTE LIMPO DA APLICAÇÃO (SOLID / ESM)
```

---

## 📄 Licença e Direitos Autorais

Criado por **Heron Silva** ([@meherons](https://github.com/meherons)) sob a licença open-source [MIT](LICENSE).
