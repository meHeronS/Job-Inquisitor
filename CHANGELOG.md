# Changelog - Job Inquisitor

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Adicionado (Added)
- **Motor Semântico de IA (Ollama):** O sistema não depende mais apenas de heurísticas regex/palavras-chave. A avaliação de Vagas Fantasmas e Tóxicas agora é feita via inferência semântica local (Prompt Engineering), interpretando as "entrelinhas" da vaga.
- **ATS Local (Kanban):** Criação do `ApplicationTrackingService`. O sistema agora persiste o ciclo de vida das vagas em um banco JSON local (`data/applications.json`), com status: `Aguardando Retorno`, `Entrevista`, `Recusado`, `Quarentena`.
- **Sincronização Ativa de E-mail:** O `EmailService` agora atua de forma cruzada com o ATS Local. Ao identificar um e-mail de "recusa" ou "convite", ele cruza o remetente com a base de vagas e atualiza o Kanban automaticamente.
- **Quarentena de Vagas (Prevenção de Falsos Positivos):** Vagas bloqueadas pela IA por suspeita de toxicidade não são mais descartadas. Elas vão para a Quarentena e podem ser revisadas/anuladas pelo usuário através do CLI.
- **Ghost Writer / Copiloto de Chat:** Adição do módulo interativo no CLI (`💬 Chat: Copiloto Interativo`). O LLM assume a persona do candidato (com base no currículo e Tom de Voz extraídos) para responder perguntas de formulários (ex: Gupy, Inhire) em primeira pessoa, mantendo uma regra estrita "Anti-IA" (sem jargões e formatação clichê).
- **Extração de Perfil Avançado 360º:** O `LLMService` agora extrai 5 tamanhos de resumos (`micro`, `short`, `medium`, `long`, `extraLong`), feedback para ATS (`atsImprovements`), e personalidade (`toneOfVoice`).
- **Teste de Integração (Túnel de Vento):** `test-runner.js` atualizado para cobrir a Validação Estrutural do Perfil 360º (Teste 8) e o Ciclo de Vida do ATS/Email (Teste 9).
- **Entrada Manual de Vagas:** Nova opção no CLI para registrar candidaturas feitas manualmente pelo usuário em portais bloqueados contra automação, permitindo o rastreio via E-mail.

### Alterado (Changed)
- **Motor Heurístico Rebaixado para Fallback:** As antigas validações hardcoded de "Banco de talentos" e "PJ 1500" agora atuam como "Plano B". Se a conexão com o servidor local do Ollama falhar (ou demorar mais de 3 segundos), o sistema assume o fallback silenciosamente, garantindo a resiliência do robô.
- **Prompt Dinâmico da IA:** A Persona da IA no `LLMService` passou de um hardcode "Recrutador Tech" para uma interpolação dinâmica baseada no cargo real extraído do currículo do usuário, garantindo universalidade profissional.
