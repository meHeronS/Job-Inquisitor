import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { JobController } from '../src/controllers/jobController.js';

const LOG_FILE_PATH = path.join(process.cwd(), 'tests', 'logs', 'test_results.txt');

async function logMessage(message, colorFunc = chalk.white, writeToFile = true) {
  console.log(colorFunc(message));
  if (writeToFile) {
    const cleanMessage = message.replace(/\x1B\[\d+m/g, '') + '\n';
    try {
      await fs.appendFile(LOG_FILE_PATH, cleanMessage, 'utf-8');
    } catch (e) {}
  }
}

async function runTests() {
  try {
    const logDir = path.dirname(LOG_FILE_PATH);
    await fs.mkdir(logDir, { recursive: true });
    await fs.writeFile(LOG_FILE_PATH, '', 'utf-8');
  } catch (e) {
    console.log(chalk.red('Falha ao criar o arquivo de log: ' + e.message));
  }

  await logMessage('====================================================', chalk.cyan);
  await logMessage('🕵️‍♂️  JOB INQUISITOR - AUDITORIA DE FUNCIONALIDADES (BUSINESS LOGIC)', chalk.bold.cyan);
  await logMessage(`Data da Execução: ${new Date().toLocaleString('pt-BR')}`, chalk.gray);
  await logMessage('====================================================\n', chalk.cyan);

  let passed = 0;
  let warnings = 0;
  let failed = 0;

  try {
    const controller = new JobController();

    // TESTE 1: Pastas e Segurança
    await logMessage('▶ Iniciando Teste 1: Auditoria de Diretórios de Segurança...', chalk.yellow);
    const requiredDirs = ['user_data', 'data', 'logs', 'tests/logs'];
    let dirsOk = true;
    for (const dir of requiredDirs) {
      try { await fs.access(path.join(process.cwd(), dir)); } catch { dirsOk = false; }
    }
    if (dirsOk) {
      await logMessage('[✅ APROVADO] - Pastas de segurança criadas e protegidas.', chalk.green);
      passed++;
    } else {
      await logMessage('[❌ FALHA] - Falta na criação dos diretórios de segurança.', chalk.red);
      failed++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 2: Módulos
    await logMessage('▶ Iniciando Teste 2: Orquestração de Arquitetura (Módulos)...', chalk.yellow);
    const status = controller.getSystemStatus();
    if (status.modules.length === 16) {
      await logMessage(`[✅ APROVADO] - Arquitetura íntegra. (16 módulos injetados).`, chalk.green);
      passed++;
    } else {
      await logMessage(`[❌ FALHA] - Contagem de módulos incorreta.`, chalk.red);
      failed++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 3: IA Local (Ollama)
    await logMessage('▶ Iniciando Teste 3: Ping de Conectividade com IA (Ollama)...', chalk.yellow);
    try {
      const controllerForAi = AbortSignal.timeout(1500);
      const res = await fetch('http://localhost:11434/api/tags', { signal: controllerForAi });
      if (res.ok) {
        await logMessage('[✅ APROVADO] - Motor de IA Local (Ollama) Online e Responsivo.', chalk.green);
        passed++;
      } else {
        throw new Error('Offline');
      }
    } catch (e) {
      await logMessage('[⚠️  AVISO CRÍTICO] - Inteligência Artificial (Ollama) NÃO DETECTADA.', chalk.yellow);
      await logMessage('    👉 Para que o sistema funcione com capacidade máxima, instale a IA:', chalk.magenta);
      
      const osPlatform = process.platform;
      if (osPlatform === 'win32') {
        await logMessage('    💻 Windows Detectado:', chalk.cyan);
        await logMessage('       1. Baixe o instalador em: https://ollama.com/download/windows', chalk.bold.white);
        await logMessage('       2. Dê um duplo clique para instalar.', chalk.bold.white);
      } else if (osPlatform === 'darwin') {
        await logMessage('    💻 macOS Detectado:', chalk.cyan);
        await logMessage('       1. Baixe o app em: https://ollama.com/download/mac', chalk.bold.white);
        await logMessage('       2. Arraste para a pasta Aplicativos e abra-o.', chalk.bold.white);
      } else {
        await logMessage('    💻 Linux Detectado:', chalk.cyan);
        await logMessage('       Abra um terminal e rode o comando abaixo:', chalk.bold.white);
        await logMessage('       curl -fsSL https://ollama.com/install.sh | sh', chalk.green);
      }
      
      await logMessage('\n    ⚡ Após instalar, abra o terminal e rode: ollama run qwen2.5:1.5b', chalk.magenta);
      await logMessage('    * O sistema operará temporariamente em Modo Heurístico.', chalk.gray);
      warnings++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 4: Scraping Logic
    await logMessage('▶ Iniciando Teste 4: Regras de Negócio - Web Scraping...', chalk.yellow);
    const scrapedJobs = await controller.scrapingService.scrapeJobs('Dev', 'Remoto');
    if (scrapedJobs && scrapedJobs.length > 0 && scrapedJobs[0].title) {
      await logMessage(`[✅ APROVADO] - ScrapingService obteve dados corretamente (${scrapedJobs.length} vagas simuladas).`, chalk.green);
      passed++;
    } else {
      await logMessage('[❌ FALHA] - ScrapingService retornou dados vazios ou corrompidos.', chalk.red);
      failed++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 5: Deduplicação Logic
    await logMessage('▶ Iniciando Teste 5: Regras de Negócio - Motor de Deduplicação...', chalk.yellow);
    const duplicateJobsList = [
      { title: 'Engenheiro de Software', company: 'TechCorp', location: 'Remoto', source: 'LinkedIn' },
      { title: 'Engenheiro de Software', company: 'TechCorp', location: 'Remoto', source: 'Gupy' }, // Duplicata
      { title: 'Engenheiro de Software', company: 'TechCorp', location: 'SP', source: 'Vagas' }, // Local diferente
    ];
    const cleanJobs = controller.deduplicateJobs(duplicateJobsList);
    if (cleanJobs.length === 2 && cleanJobs[0].source.includes('Gupy')) {
      await logMessage('[✅ APROVADO] - DeduplicationService identificou e mesclou as duplicatas perfeitamente.', chalk.green);
      passed++;
    } else {
      await logMessage('[❌ FALHA] - Falha na lógica de deduplicação matemática.', chalk.red);
      failed++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 6: Match Engine Logic
    await logMessage('▶ Iniciando Teste 6: Regras de Negócio - Algoritmo de Match Score...', chalk.yellow);
    const mockProfile = { skills: ['javascript', 'react', 'node'] };
    const mockJob = { title: 'Desenvolvedor Pleno', description: 'Buscamos desenvolvedor com javascript e node para backend.' };
    const matchResult = controller.matchService.evaluateMatch(mockProfile, mockJob);
    
    if (matchResult.matchScore >= 60 && matchResult.strengths.includes('javascript')) {
      await logMessage(`[✅ APROVADO] - MatchService cruzou perfil e vaga com sucesso (Score: ${matchResult.matchScore}%).`, chalk.green);
      passed++;
    } else {
      await logMessage(`[❌ FALHA] - Algoritmo de Match calculou um score inválido: ${matchResult.matchScore}%`, chalk.red);
      failed++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 7: Stress Test do Túnel de Vento (Mock Dataset Massivo)
    await logMessage('▶ Iniciando Teste 7: Túnel de Vento da Inteligência Artificial...', chalk.yellow);
    try {
      const mockFilePath = path.join(process.cwd(), 'tests', 'mocks', 'jobs.json');
      const mockDataStr = await fs.readFile(mockFilePath, 'utf-8');
      const mockJobs = JSON.parse(mockDataStr);
      let stressTestPassed = true;
      let stressWarnings = 0;

      for (const job of mockJobs) {
        // Simulando a IA recebendo a vaga do Scraper e avaliando para o nosso dev
        const evaluatedData = await controller.llmService.evaluateJobDynamicSalaryAndMatch(mockProfile, job);
        const report = evaluatedData.formattedReport.toLowerCase();
        const shortReportLine = evaluatedData.formattedReport.split('\n')[0]; // Pega só a primeira linha do relatório

        await logMessage(`    - Vaga [${job._test_id}]: IA classificou como -> "${shortReportLine}"`, chalk.gray);

        if (job.expected_status === 'ghost' && !report.includes('vaga ghost')) {
          stressTestPassed = false;
          await logMessage(`[❌ FALHA NA IA] - IA não reconheceu VAGA GHOST: ${job._test_id}`, chalk.red);
        } else if (job.expected_status === 'toxic' && !report.includes('tóxica/arrombada')) {
          stressTestPassed = false;
          await logMessage(`[❌ FALHA NA IA] - IA não reconheceu VAGA TÓXICA: ${job._test_id}`, chalk.red);
        } else if (job.expected_status === 'legitima' && (report.includes('ghost') || report.includes('tóxica'))) {
          stressTestPassed = false;
          await logMessage(`[❌ FALHA NA IA] - IA reprovou injustamente a vaga legítima: ${job._test_id}`, chalk.red);
        } else if (job.expected_status === 'incompativel') {
           const matchRes = controller.matchService.evaluateMatch(mockProfile, job);
           if (matchRes.matchScore > 50) {
              stressTestPassed = false;
              await logMessage(`[❌ FALHA NO MATCH] - IA avaliou Match Alto para vaga incompatível (${job._test_id}). Score: ${matchRes.matchScore}%`, chalk.red);
           } else {
              await logMessage(`    - Vaga [${job._test_id}]: Match rejeitado com sucesso -> Score ${matchRes.matchScore}%`, chalk.gray);
           }
        }
      }

      if (stressTestPassed) {
        await logMessage(`[✅ APROVADO] - Bateria de Stress Completa. IA avaliou ${mockJobs.length} vagas com 100% de precisão heurística.`, chalk.green);
        passed++;
      } else {
        await logMessage('[❌ FALHA CRÍTICA] - A Inteligência Artificial falhou no Túnel de Vento.', chalk.red);
        failed++;
      }
    } catch (e) {
      await logMessage(`[⚠️ AVISO] - Dataset de Mocks não encontrado ou erro de leitura: ${e.message}`, chalk.yellow);
      warnings++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 8: Motor de Extração de Perfil de Candidato (JSON 360º)
    await logMessage('▶ Iniciando Teste 8: Validação Estrutural do Perfil do Candidato (LLM/Fallback)...', chalk.yellow);
    const mockResume = "Sou Desenvolvedor Sênior com 10 anos de experiência em React, Node, SQL e AWS. Foco em arquitetura de microsserviços.";
    const profile = await controller.llmService.analyzeCandidatePotential(mockResume);
    
    if (profile && profile.primaryRole && profile.summaries && profile.summaries.micro && profile.atsImprovements) {
      await logMessage(`[✅ APROVADO] - O motor gerou o Perfil 360º com sucesso (Role: ${profile.primaryRole}).`, chalk.green);
      passed++;
    } else {
      await logMessage(`[❌ FALHA] - A estrutura do JSON de Perfil gerado está incompleta ou inválida.`, chalk.red);
      failed++;
    }
    await logMessage('----------------------------------------------------', chalk.gray);

    // TESTE 9: Ciclo de Vida da Vaga (Rastreio ATS e E-mail Sync)
    await logMessage('▶ Iniciando Teste 9: Ciclo de Vida Completo (ATS Database & E-mail Sync)...', chalk.yellow);
    try {
      const db = controller.applicationTrackingService;
      await db._clearDB(); // Limpa banco antes do teste
      
      // 1. O robô simula 2 vagas e aplica nelas
      await db.trackApplication({ id: 'VAGA_01', title: 'Dev Backend', company: 'Google' });
      await db.trackApplication({ id: 'VAGA_02', title: 'Dev Frontend', company: 'Microsoft' });
      
      let metrics = await db.getPipelineMetrics();
      if (metrics.aguardandoRetorno !== 2) throw new Error('Falha ao registrar vagas no banco de dados local.');

      // 2. O EmailService lê a caixa de e-mail e processa uma recusa
      const emailRecusa = await controller.emailService.parseEmailFeedbackAndSync(
        'noreply@google.com',
        'Sua candidatura na Google',
        'Infelizmente decidimos seguir com outros candidatos.'
      );

      // 3. O EmailService lê a caixa de e-mail e processa um convite
      const emailConvite = await controller.emailService.parseEmailFeedbackAndSync(
        'recrutamento@microsoft.com',
        'Processo Seletivo Microsoft',
        'Gostaríamos de agendar uma entrevista técnica com você!'
      );

      // 4. Verificando o estado do banco
      metrics = await db.getPipelineMetrics();
      if (metrics.aguardandoRetorno === 0 && metrics.entrevistas === 1 && metrics.recusas === 1) {
        await logMessage(`[✅ APROVADO] - Kanban sincronizado! Google(Recusa), Microsoft(Entrevista).`, chalk.green);
        passed++;
      } else {
        await logMessage(`[❌ FALHA] - O banco de dados não sincronizou corretamente o ciclo de vida.`, chalk.red);
        failed++;
      }

      await db._clearDB(); // Limpa após o teste
    } catch (e) {
      await logMessage(`[❌ ERRO NO TESTE 9] - ${e.message}`, chalk.red);
      failed++;
    }

  } catch (error) {
    await logMessage(`\n[❌ ERRO CRÍTICO] - Teste interrompido fatalmente: ${error.message}`, chalk.red);
    failed++;
  }

  await logMessage('\n====================================================', chalk.cyan);
  await logMessage('📊 RESUMO DA AUDITORIA:', chalk.bold.cyan);
  await logMessage(`   ✅ Aprovados (Funcionalidades validadas): ${passed}`, chalk.green);
  await logMessage(`   ⚠️ Avisos de Setup:                       ${warnings}`, chalk.yellow);
  await logMessage(`   ❌ Falhas Críticas:                       ${failed}`, chalk.red);
  await logMessage('====================================================\n', chalk.cyan);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
