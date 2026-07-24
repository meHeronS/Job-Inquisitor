# Changelog - Job Inquisitor 🕵️‍♂️

Todas as alterações notáveis, melhorias e correções deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.2] - 2026-07-23

### 📖 Documentação & Governança Técnica (Docs & Compliance)
- **Guia de Arquitetura SDLC (`docs/ARCHITECTURE_SDLC.md`):** Criado documento técnico detalhando o *onde, como e por que* de cada disciplina da Ciência da Computação (Recuperação de Informação, Sistemas Distribuídos, SOLID, DevSecOps, QA/TDD, IHC e Governança de Produto).
- **Conformidade Legal & LGPD Compliance:** Adicionada seção dedicada no `README.md` demonstrando a blindagem de privacidade local (Lei 13.709/2018), raspagem ética com delays humanizados e isenção de responsabilidade open-source.
- **Padrão de Citação GitHub (`CITATION.cff`):** Adicionado arquivo padrão de citação acadêmica e industrial com o botão nativo *"Cite este repositório"* no GitHub.
- **Engenharia Pareada com IA (AI-Assisted Engineering):** Incluída a declaração de desenvolvimento pareado com IA em alinhamento com Antigravity (Google DeepMind Team).
- **Licença MIT & Autoria:** Adicionado o arquivo [LICENSE](LICENSE) oficial garantindo legalmente a exigência de atribuição de direitos autorais a **Heron Silva ([@meherons](https://github.com/meherons))**.

---

## [1.0.1] - 2026-07-23

### 🔒 Segurança & Estrutura Git (Security & Fixed)
- **Correção da Regra do `.gitignore`:** Atualizada a configuração do `.gitignore` para permitir que o Git rastreie as pastas `user_data/`, `data/` e `logs/` através dos arquivos neutros `.gitkeep`, mantendo o conteúdo privado (`*.pdf`, `*.json`, `*.log`) 100% ignorado e protegido.
- **Autocriação Defensiva de Diretórios (`src/utils/cleanup.js`):** Implementada a autocriação defensiva automática no 1º milissegundo de execução.

---

## [1.0.0] - 2026-07-23

### 🚀 Adicionado (Added)
- **Identidade & Branding:** Lançamento da primeira versão oficial do **Job Inquisitor 🕵️‍♂️** sob a autoria de **Heron Silva ([@meherons](https://github.com/meherons))**.
- **Descoberta Dinâmica via IA (`CompanyCareerPageService`):** A IA identifica autonomamente as líderes de mercado para o segmento de qualquer profissional.
- **Relatório Ultra-Enxuto (`LLMService`):** Formato compacto de 3 linhas otimizado para candidaturas de alta escala (50+ vagas/dia).
- **Criptografia Militar de Hardware (`SecurityCryptoService`):** Derivação de chave PBKDF2 HMAC-SHA256 combinando a impressão digital da máquina (CPU + Hostname) + AES-256-GCM + `chmod 600`.
- **Autenticação SSO & E-mails:** Suporte a **Google One-Tap SSO Popup** e **OAuth 2.0** (Gmail e Microsoft Outlook).
- **12 Portais Alvo (`ScrapingService`):** Varredura no LinkedIn, Gupy, Solides, Vagas.com, InfoJobs, 99Jobs, Glassdoor, Catho, Greenhouse, Lever, Workday e RemoteOK.
