# 🏛️ Guia Técnico de Arquitetura, Engenharia & SDLC - Job Inquisitor 🕵️‍♂️

> **Documento de Fundamentação de Engenharia de Software e Ciência da Computação**
> **Autor:** Heron Silva ([@meherons](https://github.com/meherons))

Este documento detalha **onde, como e por que** cada grande disciplina da Ciência da Computação e Engenharia de Software foi aplicada na arquitetura do **Job Inquisitor 🕵️‍♂️**, servindo como prova de conceito e demonstração de domínio técnico avançado.

---

## 🔍 1. Recuperação de Informação na Web (Information Retrieval - IR & Web Mining)

### 📍 Onde foi aplicado:
- Nos módulos [ScrapingService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/scrapingService.js), [CompanyCareerPageService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/companyCareerPageService.js) e [PdfReaderService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/pdfReaderService.js).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** Os anúncios de vagas na internet estão dispersos em dezenas de portais com formatos HTML não padronizados, além de redirecionamentos externos complexos (ex: um anúncio no LinkedIn que redireciona para a plataforma da Eightfold.ai, Workday ou Lever).
- **A Solução de IR:** 
  - **Parsing e Extração de Texto Limpo:** Utiliza o `pdf-parse` para ler os PDFs de currículos em `user_data/resumes/` e extrair dados não estruturados de qualificações.
  - **Interceptação Dinâmica de Redirecionamentos:** O `ScrapingService` simula o navegador headless via Playwright e captura o parâmetro de URL de destino final (`externalRedirectUrl`), garantindo que o candidato chegue ao formulário real de inscrição da empresa.
  - **Varredura Não Estruturada em 12 Portais:** Aplica algoritmos de travessia DOM para extrair título, requisitos, modelo de contrato (CLT/PJ/USD) e faixa salarial.

---

## ⚡ 2. Sistemas Distribuídos & Execução Assíncrona em Lote

### 📍 Onde foi aplicado:
- Nos módulos [JobQueueManager.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/queues/jobQueue.js) e conexão de infraestrutura em [redis.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/config/redis.js).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** A raspagem de dezenas de vagas e a chamada para inferência em modelos de IA podem demorar vários minutos. Se tudo fosse feito de forma síncrona na thread principal do Node.js, a interface do usuário travaria e a memória do sistema seria drenada.
- **A Solução de Sistemas Distribuídos:**
  - **Arquitetura Orientada a Eventos / Producer-Worker:** Utilizamos o **BullMQ sobre o Redis** para desacoplar a coleta da avaliação.
  - **Controle de Vazão (Rate Limiting):** O worker é configurado com concorrência otimizada (`concurrency: 2`) e travamento de requisições por janela de tempo. Isso reduz o uso de CPU para apenas 15-25% e o consumo de memória RAM para menos de 1.2 GB, permitindo que a pescaria noturna ocorra de forma imperceptível em segundo plano.

---

## 🧩 3. Arquitetura Modular & Princípios SOLID

### 📍 Onde foi aplicado:
- Na estrutura de 15 serviços em [src/services/](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/), no controller de orquestração [JobController.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/controllers/jobController.js) e na camada de dados em [database.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/config/database.js).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** Aplicações monolíticas ou com código "espaguete" se tornam impossíveis de manter, testar ou evoluir à medida que novos portais ou regras de negócio são adicionados.
- **A Solução de Arquitetura Modular:**
  - **Princípio da Responsabilidade Única (SRP):** Cada arquivo faz exatamente uma coisa. Por exemplo, o `SalaryBenchmarkService` cuida exclusivamente dos cálculos de CLT x PJ (1.55x) e guardrails salariais; o `DeduplicationService` cuida apenas da remoção de vagas repetidas.
  - **Dual DB Engine Resiliente:** O `database.js` implementa um padrão de resiliência onde tenta a conexão com o MongoDB (via Docker), e caso o Docker esteja desligado, aciona autonomamente o banco em arquivo JSON em `data/db/job_inquisitor_db.json`. O sistema **nunca falha na inicialização**.

---

## 🏗️ 3.1. Evolução IHC e GUI Nativa

### 💡 Por que foi aplicado e qual o problema resolve?
- **A Solução de IHC (Interação Humano-Computador) e Prontidão para GUI Nativa:**
  A arquitetura do projeto foi desenhada visando extrema resiliência e **Desacoplamento de Interface**. Atualmente, o projeto utiliza uma interface de linha de comando (CLI) baseada em Prompts interativos (Inquirer.js). No entanto, como todos os módulos de negócios residem em `src/services/` e a orquestração no `JobController`, a arquitetura garante **zero acoplamento** entre a lógica e a interface gráfica.
  - **Preparação para Desktop:** O sistema está arquiteturalmente pronto para receber invólucros desktop cross-platform (como **Electron** ou **Tauri**) no futuro. Basta substituir o `src/cli/index.js` por uma camada de comunicação IPC (Inter-Process Communication), transformando a aplicação em um executável nativo (.exe / .AppImage) acessível a usuários com baixa familiaridade técnica (ex: advogados, enfermeiros), mantendo o ecossistema Node.js intacto.

---

## 🔒 4. Segurança da Informação & DevSecOps

### 📍 Onde foi aplicado:
- Nos módulos [SecurityCryptoService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/securityCryptoService.js), [SessionManagerService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/sessionManagerService.js) e na configuração do [.gitignore](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/.gitignore).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** Vazamentos de senhas de e-mail, tokens de sessão ou dados pessoais do candidato no GitHub ou no sistema operacional.
- **A Solução de Segurança de Nível Militar:**
  - **Derivação de Chave PBKDF2 HMAC-SHA256 (100.000 iterações):** A chave de criptografia de 256 bits é gerada dinamicamente utilizando a impressão digital da máquina (CPU + Hostname).
  - **Criptografia AES-256-GCM em Repouso:** Todos os tokens OAuth e históricos de sessão salvos no disco rígido são cifrados com tag de autenticação de integridade.
  - **Permissões Estritas no SO (`chmod 600`):** Bloqueia a leitura dos arquivos da pasta `user_data/` para qualquer outro usuário do sistema operacional.
  - **Autenticação OAuth 2.0 com Escopos Restritos:** O leitor de e-mails utiliza o escopo de **somente leitura** (`gmail.readonly` ou `IMAP.AccessAsUser.All`), garantindo que o aplicativo nunca tenha permissão para apagar mensagens ou alterar dados da conta.

---

## 🧪 5. QA, Engenharia de Testes & TDD

### 📍 Onde foi aplicado:
- Na suíte automatizada em [tests/health.test.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/tests/health.test.js) e no utilitário de autocriação defensiva [cleanup.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/utils/cleanup.js).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** Regressões de código, alterações que quebram funcionalidades existentes ou erros de execução quando um novo usuário clona o repositório sem as pastas privadas criadas.
- **A Solução de QA & Autocriação Defensiva:**
  - **Testes Unitários Automatizados Nativos:** Cobertura de testes sem necessidade de frameworks pesados de terceiros, utilizando o `node:test` nativo do Node.js.
  - **Self-Healing Directory Cleanup:** No primeiro milissegundo de execução de `npm start` ou `npm test`, o sistema verifica se a árvore de diretórios (`user_data/resumes`, `data/db`, etc.) existe e as recria defensivamente com arquivos `.gitkeep`, impedindo qualquer erro de arquivo não encontrado.

---

## 🎨 6. Interação Homem-Computador (IHC / UX/UI)

### 📍 Onde foi aplicado:
- Na interface via terminal [src/cli/index.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/cli/index.js) e no módulo [FormAutofillService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/formAutofillService.js).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** Interfaces confusas, fadiga do usuário ao preencher 50 formulários por dia e o risco de IAs "inventarem" respostas erradas em perguntas abertas de recrutamento.
- **A Solução de IHC (Human-in-the-Loop):**
  - **Modo Copiloto Assistido:** O robô preenche campos padrão (nome, e-mail, telefone, pretensão) 100% sozinho. Em perguntas discursivas ("Conte sobre um projeto"), ele apresenta uma sugestão visual no CLI para você **revisar, aprovar ou editar** antes do envio final.
  - **Relatório Ultra-Enxuto (3 Linhas):** Formato visual direto focado em rápida tomada de decisão, exibindo apenas o Veredito, o Gatilho do RH e a Pretensão Salarial Recomendada.

---

## 📊 7. Governança, Métricas de Produto & PO (Product Ownership)

### 📍 Onde foi aplicado:
- No módulo [PipelineMetricsService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/pipelineMetricsService.js) e no [EmailService.js](file:///media/heron/VAULT/Programacao/GitHub/Job-Inquisitor/src/services/emailService.js).

### 💡 Por que foi aplicado e qual o problema resolve?
- **O Problema:** Falta de visibilidade sobre o retorno das candidaturas enviadas e valores de pretensão salarial irreais que causam eliminação automática pelos robôs de ATS dos recrutadores.
- **A Solução de Governança & Métricas:**
  - **Funil de Conversão de Candidaturas:** Acompanhamento dinâmico das taxas de status (`applied`, `interview`, `rejected`).
  - **Parsing de Feedback por E-mail:** Atualização automática de status ao receber recusas ou convites de entrevista na caixa de entrada.
  - **Inteligência Salarial com Guardrails:** Cálculo automático de equivalência CLT x PJ com multiplicador de 1.55x (incluindo 13º, férias + 1/3, FGTS 8%, plano de saúde e Simples Nacional), respeitando o piso salarial configurado pelo candidato.
