import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import readline from 'node:readline';
import { JobController } from '../controllers/jobController.js';

const controller = new JobController();

async function extractAllPdfs() {
  let combinedText = '';
  const folders = ['resumes', 'letters'];

  for (const folder of folders) {
    const dirPath = path.join(process.cwd(), 'user_data', folder);
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (file.toLowerCase().endsWith('.pdf')) {
          console.log(chalk.blue(`[Info]: Extraindo texto do arquivo ${folder}/${file}...`));
          const pdfPath = path.join(dirPath, file);
          const text = await controller.readResumePdf(pdfPath);
          combinedText += `\n--- CONTEÚDO DE ${file} ---\n${text}\n`;
        }
      }
    } catch (e) {
      // Ignora se a pasta não existir ou estiver vazia
    }
  }

  if (!combinedText.trim()) {
    throw new Error('Nenhum arquivo PDF encontrado nas pastas user_data/resumes/ ou user_data/letters/.');
  }
  if (combinedText.length > 40000) {
    console.log(chalk.yellow(`\n[Aviso de Sobrecarga]: Você enviou arquivos demais (${combinedText.length} caracteres).`));
    console.log(chalk.yellow(`Para proteger a memória da Inteligência Artificial e evitar confusão de perfil, o texto foi cortado em 40.000 caracteres.`));
    console.log(chalk.gray(`(Dica: Mantenha apenas os seus currículos e cartas mais relevantes nas pastas user_data/resumes e user_data/letters)\n`));
    combinedText = combinedText.substring(0, 40000);
  }

  return combinedText;
}

async function handleApplySession(controller) {
  const apps = await controller.applicationTrackingService.getAllApplications();
  const newJobs = apps.filter(a => a.status === 'Nova Vaga' || !a.status);

  if (newJobs.length === 0) {
    console.log(chalk.yellow('\n[Aviso]: Não há novas vagas aprovadas pendentes de candidatura no momento!'));
    console.log(chalk.gray('Você já se candidatou a todas as vagas aprovadas ou precisa rodar a busca (Opção 1) para encontrar novas vagas.'));
    return;
  }

  let profile = {};
  try {
    const pData = await fs.readFile(path.join(process.cwd(), 'user_data', 'profile.json'), 'utf-8');
    profile = JSON.parse(pData);
  } catch {}

  console.log(chalk.cyan(`\n📋 [Processo de Candidatura Guiado]: Apresentando ${newJobs.length} vagas aprovadas em sequência...\n`));

  for (let i = 0; i < newJobs.length; i++) {
    const targetJob = newJobs[i];
    const targetUrl = targetJob.externalRedirectUrl || targetJob.url;

    console.log(chalk.yellow(`\n---------------------------------------------------`));
    console.log(chalk.greenBright(`📍 Vaga ${i + 1}/${newJobs.length}: ${targetJob.title}`));
    console.log(chalk.cyan(`🏢 Empresa: ${targetJob.company} | 📍 Local: ${targetJob.location || 'Remoto'}`));
    console.log(chalk.gray(`🔗 Link: ${targetUrl}`));
    if (jobHasReport(targetJob)) {
      console.log(chalk.gray(`💡 Parecer IA: ${targetJob.formattedReport || targetJob.reason || 'Qualificada'}`));
    }
    console.log(chalk.yellow(`---------------------------------------------------`));

    const { action } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'action',
        message: `Escolha a ação para a vaga ${i + 1}/${newJobs.length}:`,
        choices: [
          { name: '🌐  1. Abrir Link & Candidatar-se', value: 'apply' },
          { name: '🗑️   2. Descartar Vaga', value: 'discard' },
          { name: '⏭️   3. Pular Vaga', value: 'skip' },
          { name: '⬅️   4. Voltar ao Menu', value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      console.log(chalk.gray('\nSessão de candidatura pausada. Retornando ao menu principal...\n'));
      break;
    }

    if (action === 'skip') {
      console.log(chalk.gray(`Avançando para a próxima vaga...\n`));
      continue;
    }

    if (action === 'discard') {
      await controller.applicationTrackingService.trackApplication(targetJob, 'Ignorado');
      await controller.applicationTrackingService.deleteApplication(targetJob.id); // Remove de ativas
      await controller.refreshAllReports();
      console.log(chalk.red(`\n🗑️  Vaga da ${targetJob.company} descartada manualmente por você e salva em vagas_descartadas.md.\n`));
      continue;
    }

    if (action === 'apply') {
      console.log(chalk.green(`\n🚀 [Sistema Abriu Link]: Abrindo candidatura no seu navegador padrão...`));
      const sysPlatform = process.platform;
      let openCmd = sysPlatform === 'win32' ? `start "" "${targetUrl}"` : sysPlatform === 'darwin' ? `open "${targetUrl}"` : `xdg-open "${targetUrl}"`;
      exec(openCmd, (err) => {
        if (err) console.log(chalk.yellow(`Abra o link manualmente: ${targetUrl}`));
      });

      console.log(chalk.magentaBright('\n🤖 [Copiloto IA Ativo]: Digite qualquer pergunta do formulário para a IA responder.'));
      console.log(chalk.gray('💡 Digite "ok", "finalizar" ou "pronto" quando concluir a candidatura no navegador.\n'));

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const askQuestion = (queryText) => new Promise(res => rl.question(queryText, res));

      while (true) {
        const input = await askQuestion(chalk.cyan('💬 Pergunta do Formulário (ou "ok" para concluir): '));
        const cleanInput = input.trim();

        if (['ok', 'finalizar', 'pronto', 'fim', 'sair', 'done'].includes(cleanInput.toLowerCase())) {
          break;
        }

        if (!cleanInput) continue;

        console.log(chalk.yellow('\n🤖 [IA Pensando...] Gerando resposta otimizada baseada no seu perfil...\n'));
        const response = await controller.llmService.generateTailoredCoverLetterOrAnswer(profile, targetJob, cleanInput);
        console.log(chalk.greenBright(`--- Resposta Sugerida pela IA ---`));
        console.log(chalk.white(response));
        console.log(chalk.greenBright(`---------------------------------\n`));
      }

      rl.close();

      // Transição de Status para Aguardando Retorno
      await controller.applicationTrackingService.updateStatusById(targetJob.id, 'Aguardando Retorno', 'Candidatura efetuada via Assistente Interativo');
      await controller.refreshAllReports();

      console.log(chalk.green(`\n✅ [Sucesso]: Vaga da ${targetJob.company} atualizada para "⏳ Aguardando Retorno"!`));

      // Exibe contadores de métricas
      const metrics = await controller.applicationTrackingService.getPipelineMetrics();
      const allHistoric = await controller.applicationTrackingService.getAllHistoricJobs();

      console.log(chalk.cyan('\n📊 [Painel de Métricas Atualizado do Pipeline]:'));
      console.log(chalk.white(` 📈 Total de Vagas Mapeadas no Histórico: ${allHistoric.length}`));
      console.log(chalk.green(` 🟢 Novas Vagas Aprovadas Pendentes: ${metrics.novas}`));
      console.log(chalk.yellow(` ⏳ Candidaturas Efetuadas (Aguardando Retorno): ${metrics.aguardandoRetorno}`));
      console.log(chalk.magenta(` 🎯 Convites de Entrevista: ${metrics.entrevistas}`));
      console.log(chalk.gray(` 🛑 Recusas de Processos: ${metrics.recusas}\n`));
    }
  }
}

function jobHasReport(job) {
  return Boolean(job.formattedReport || job.reason);
}

async function runCLI() {
  console.clear();

  const logo = `
      _       _       ___                  _     _ _
     | | ___ | |__   |_ _|_ __   __ _ _   _(_)___(_) |_ ___  __
  _  | |/ _ \\| '_ \\   | || '_ \\ / _\` | | | | / __| | __/ _ \\| '__|
 | |_| | (_) | |_) |  | || | | | (_| | |_| | \\__ \\ | || (_) | |
  \\___/ \\___/|_.__/  |___|_| |_|\\__, |\\__,_|_|___/_|\\__\\___/|_|
                                   |_|
     .----.
    /  _   \\   Copiloto de Vagas Automático
   |  ( )   |  "Buscando as melhores oportunidades..."
    \\      /
     '----'
       \\ \\
        \\_\\
  `;
  console.log(chalk.greenBright(logo));
  console.log(chalk.gray('Iniciando motores do Playwright e IA Local...\n'));

  // Validações de Boot
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  process.stdout.write(chalk.cyan('➜ Validando integridade dos módulos internos... '));
  await wait(400);
  const status = controller.getSystemStatus();
  if (status.modules.length === 16) console.log(chalk.green('OK'));

  process.stdout.write(chalk.cyan('➜ Checando Banco de Dados (ATS Local)... '));
  await wait(300);
  console.log(chalk.green('OK'));

  process.stdout.write(chalk.cyan('➜ Ping no Servidor de IA (Ollama)... '));
  try {
    const controllerForAi = AbortSignal.timeout(1000);
    const res = await fetch('http://localhost:11434/api/tags', { signal: controllerForAi });
    if (res.ok) console.log(chalk.green('OK (Online)'));
    else throw new Error();
  } catch (e) {
    console.log(chalk.yellow('OFFLINE (Modo Heurístico Ativado)'));
  }

  process.stdout.write(chalk.cyan('➜ Validando Identidade do Candidato... '));
  await wait(300);
  const profilePath = path.join(process.cwd(), 'user_data', 'profile.json');
  try {
    await fs.access(profilePath);
    console.log(chalk.green('OK (Perfil Carregado)'));
  } catch (e) {
    console.log(chalk.red('AUSENTE'));
    console.log(chalk.yellow('\n[Atenção]: O Job Inquisitor precisa ler o seu currículo para entender quem você é.'));
    console.log(chalk.gray('(Dica: Insira seu Currículo em user_data/resumes/ e, opcionalmente, sua Carta de Apresentação em user_data/letters/)'));

    let resumeExtracted = false;
    while (!resumeExtracted) {
      try {
        console.log(chalk.cyan('\nVarrendo pastas (user_data/resumes e user_data/letters) e lendo seus documentos... (Aguarde)\n'));
        const resumeText = await extractAllPdfs();
        console.log(chalk.yellow('\n[IA]: Textos extraídos com sucesso. Consolidando sua Identidade Profissional...\n'));
        const aiProfile = await controller.evaluateCandidatePotential(resumeText);
        await fs.writeFile(profilePath, JSON.stringify(aiProfile, null, 2), 'utf-8');
        console.log(chalk.green(`[Sucesso]: Identidade Profissional gerada! Bem-vindo(a) a bordo, ${aiProfile.seniority} em ${aiProfile.primaryRole}.\n`));
        resumeExtracted = true;
      } catch (error) {
        console.log(chalk.red(`[Erro]: ${error.message}`));
        console.log(chalk.gray('Por favor, coloque seus currículos/cartas em formato PDF nas pastas corretas e pressione ENTER para tentar novamente.'));
        await inquirer.prompt([{ type: 'input', name: 'retry', message: 'Pressione ENTER quando os arquivos estiverem lá...' }]);
      }
    }
  }

  console.log(chalk.greenBright(`\n[Status]: Sistema operacional e blindado. Pronto para operar!\n`));
  while (true) {
    console.log('\n---------------------------------------------------');
    const answers = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'action',
        message: 'Selecione um módulo para iniciar (Digite o número):',
        choices: [
          { name: '🔍  1. Buscar Vagas', value: 'hunt' },
          { name: '🎯  2. Candidatar-se (Passo a Passo)', value: 'apply_session' },
          { name: '📊  3. Ver Relatórios', value: 'report' },
          { name: '☢️  4. Revisar Quarentena', value: 'quarantine' },
          { name: '📩  5. Sincronizar E-mails', value: 'email' },
          { name: '📝  6. Registrar Vaga Manual', value: 'manual' },
          { name: '🔄  7. Atualizar Perfil', value: 'profile' },
          { name: '⚙️  8. Status do Sistema', value: 'status' },
          { name: '🚪  9. Sair', value: 'exit' }
        ]
      },
    ]);

    switch (answers.action) {
      case 'apply_session':
        await handleApplySession(controller);
        break;
      case 'hunt':
        console.log(chalk.yellow('\n[Info]: Módulo de Investigação e Raspagem Universal ativado.\n'));

        let huntProfile;
        try {
          const fs = await import('node:fs/promises');
          const path = await import('node:path');
          const profilePath = path.join(process.cwd(), 'user_data', 'profile.json');
          const data = await fs.readFile(profilePath, 'utf-8');
          huntProfile = JSON.parse(data);
        } catch (e) {
          console.log(chalk.red('[Erro]: Você ainda não gerou o seu perfil! Por favor, selecione "Gerar Perfil de Candidato" primeiro.\n'));
          break;
        }

        // Criando uma busca ampla (Boolean OR) para não nichar o currículo
        const topSkills = huntProfile.skills ? huntProfile.skills.slice(0, 5).join(' OR ') : '';
        const broadAiQuery = topSkills ? `${huntProfile.primaryRole} OR ${topSkills}` : (huntProfile.primaryRole || 'Profissional');

        const huntAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'query',
            message: `Qual o cargo desejado? (Aperte Enter para Busca Ampla: ${chalk.green(broadAiQuery)})`
          },
          {
            type: 'input',
            name: 'location',
            message: `Qual a localização? (Aperte Enter para buscar no mundo todo: ${chalk.green('Worldwide')})`
          },
          {
            type: 'input',
            name: 'limit',
            message: `Quantas vagas deseja extrair antes de parar? (Aperte Enter para ${chalk.green('50')})`
          }
        ]);

        const finalQuery = huntAnswers.query.trim() || broadAiQuery;
        const finalLocation = huntAnswers.location.trim() || 'Worldwide';
        const finalLimit = parseInt(huntAnswers.limit) || 50;

        console.log(chalk.cyan(`\n🕵️‍♂️ O Inquisitor está varrendo a web atrás de ${finalLimit} vagas para "${finalQuery}" em "${finalLocation}"...`));
        console.log(chalk.gray('(Isto pode demorar alguns minutos. Pegue um café ☕ ou aperte a tecla "Q" para Parada Limpa)\n'));

        const huntAbortController = new AbortController();
        const onKeypress = (str, key) => {
          if (key && (key.name === 'q' || key.name === 's' || (key.ctrl && key.name === 'c'))) {
            console.log(chalk.yellow('\n[!] Parada Manual acionada (Tecla Q)! Encerrando raspagem e salvando o que foi avaliado até agora...'));
            huntAbortController.abort();
          }
        };

        if (process.stdin.isTTY) {
          readline.emitKeypressEvents(process.stdin);
          process.stdin.setRawMode(true);
        }
        process.stdin.on('keypress', onKeypress);

        try {
          const evaluatedJobs = await controller.searchAndEvaluateJobs(finalQuery, finalLocation, huntProfile, finalLimit, huntAbortController.signal);

          if (evaluatedJobs.length === 0) {
            console.log(chalk.red('Nenhuma vaga compatível encontrada hoje.\n'));
          } else {
            console.log(chalk.green(`\n✅ ${evaluatedJobs.length} vagas avaliadas com sucesso!`));

            console.log(chalk.yellow('Exportando Relatório VIP e salvando no Banco de Dados...'));
            const vipJobs = evaluatedJobs.filter(j => j.verdict === 'Candidatar');
            const reportPath = await controller.exportVipReport(vipJobs);
            console.log(chalk.magenta(`\n[Pronto!]: O seu relatório limpo e otimizado foi salvo em: ${reportPath}\n`));
          }
        } catch (error) {
          console.log(chalk.red(`\n[Erro fatal na Raspagem]: ${error.message}\n`));
        } finally {
          process.stdin.off('keypress', onKeypress);
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
        }
        break;

      case 'chat':
        console.log(chalk.blue('\n[Copiloto Ativado]: Olá! Eu já decorei o seu currículo. Cole aqui as perguntas chatas dos formulários de candidatura e eu escreverei as respostas perfeitas para você.'));
        console.log(chalk.gray('(Digite "sair" a qualquer momento para voltar ao menu)\n'));

        let chatProfile;
        try {
          const fs = await import('node:fs/promises');
          const path = await import('node:path');
          const profilePath = path.join(process.cwd(), 'user_data', 'profile.json');
          const data = await fs.readFile(profilePath, 'utf-8');
          chatProfile = JSON.parse(data);
        } catch (e) {
          console.log(chalk.red('\n[Erro]: Você ainda não gerou o seu perfil! Por favor, volte ao menu e selecione "Gerar Perfil de Candidato" primeiro.\n'));
          break;
        }

        let chatting = true;
        while (chatting) {
          const { question } = await inquirer.prompt([{ type: 'input', name: 'question', message: chalk.green('Pergunta da Empresa: ') }]);
          if (question.toLowerCase() === 'sair') {
            chatting = false;
            console.log(chalk.gray('\nEncerrando Copiloto...\n'));
            break;
          }

          console.log(chalk.cyan('✍️  Pensando na melhor resposta...\n'));
          const answer = await controller.llmService.answerApplicationQuestion(chatProfile, question);
          console.log(chalk.white(`📝 ${answer}\n`));
        }
        break;

      case 'manual':
        console.log(chalk.blue('\n[Manual]: Vamos registrar a vaga no seu Banco de Dados para que a IA consiga rastrear a resposta do RH.'));
        const manualJob = await inquirer.prompt([
          { type: 'input', name: 'company', message: 'Qual o nome da Empresa?' },
          { type: 'input', name: 'title', message: 'Qual o Título da Vaga?' }
        ]);
        await controller.applicationTrackingService.trackApplication({
          title: manualJob.title,
          company: manualJob.company
        });
        console.log(chalk.green(`\n[Sucesso]: Vaga da ${manualJob.company} registrada como "Aguardando Retorno"! O EmailService vai monitorar respostas para ela.\n`));
        break;

      case 'quarantine':
        console.log(chalk.yellow('\n[Quarentena]: Buscando vagas bloqueadas pela Inteligência Artificial...'));
        const quarantined = await controller.applicationTrackingService.getQuarantinedApplications();

        if (quarantined.length === 0) {
          console.log(chalk.green('A Quarentena está vazia! Nenhuma vaga suspeita retida.'));
          break;
        }

        const qChoices = quarantined.map(q => ({
          name: `[${q.company}] ${q.title} - Motivo: ${q.history[0]?.reason || 'Desconhecido'}`,
          value: q.id
        }));
        qChoices.push({ name: 'Voltar ao Menu', value: 'voltar' });

        const { selectedQ } = await inquirer.prompt([{
          type: 'rawlist', name: 'selectedQ', message: 'Selecione uma vaga para revisar (Digite o número):', choices: qChoices
        }]);

        if (selectedQ === 'voltar') break;

        const { qAction } = await inquirer.prompt([{
          type: 'rawlist', name: 'qAction', message: 'Qual é o seu Veredito Final?',
          choices: [
            { name: '✅ A IA Errou (Falso Positivo): Aprovar vaga e rastrear candidaturas.', value: 'approve' },
            { name: '🗑️  A IA Acertou: Excluir vaga definitivamente.', value: 'delete' },
            { name: '⬅️  Deixar na Quarentena por enquanto', value: 'keep' }
          ]
        }]);

        if (qAction === 'approve') {
          await controller.applicationTrackingService.updateStatusById(selectedQ, 'Aguardando Retorno', 'Anulado por intervenção humana (Falso Positivo)');
          console.log(chalk.green('\nVaga resgatada com sucesso! Ela foi movida para "Aguardando Retorno".\n'));
        } else if (qAction === 'delete') {
          await controller.applicationTrackingService.deleteApplication(selectedQ);
          console.log(chalk.red('\nVaga destruída permanentemente.\n'));
        }
        break;

      case 'email':
        console.log(chalk.blue('\n[Info]: Módulo EmailService pronto para parsing de recusas e convites de entrevista.'));

        const emailAnswers = await inquirer.prompt([
          {
            type: 'rawlist',
            name: 'provider',
            message: 'Qual provedor de e-mail você deseja conectar?',
            choices: [
              { name: 'Google (Gmail)', value: 'google' },
              { name: 'Microsoft (Outlook/Office365)', value: 'microsoft' }
            ]
          }
        ]);

        const oauthUrl = controller.emailService.generateOAuthUrl(emailAnswers.provider);

        console.log(chalk.green(`\n[Sucesso]: Link de autorização seguro gerado para ${emailAnswers.provider.toUpperCase()}!`));
        console.log(chalk.yellow('Tentando abrir o seu navegador automaticamente...'));

        const osPlatform = process.platform;
        let openCommand = '';
        if (osPlatform === 'win32') openCommand = `start "" "${oauthUrl}"`;
        else if (osPlatform === 'darwin') openCommand = `open "${oauthUrl}"`;
        else openCommand = `xdg-open "${oauthUrl}"`;

        exec(openCommand, (error) => {
          if (error) {
            console.log(chalk.red('\n[Aviso]: Não foi possível abrir o navegador sozinho.'));
            console.log(chalk.white('Por favor, clique no link abaixo ou copie e cole no seu navegador:'));
            console.log(chalk.cyan.underline(oauthUrl + '\n'));
          } else {
            console.log(chalk.magenta('\nNavegador aberto! Após o login, cole o código gerado no sistema (Em breve).\n'));
          }
        });
        break;
      case 'profile':
        console.log(chalk.magenta('\n[Segurança]: Seus documentos privados ficam salvos e isolados em user_data/ (Protegidos pelo Git).'));

        try {
          console.log(chalk.cyan('\nVarrendo pastas (user_data/resumes e user_data/letters) e lendo seus documentos... (Aguarde)\n'));
          const resumeText = await extractAllPdfs();

          console.log(chalk.green(`[Sucesso]: Textos extraídos com sucesso! (${resumeText.length} caracteres encontrados)`));
          console.log(chalk.yellow('[IA]: Analisando o perfil e extraindo habilidades e senioridade...'));
          const aiProfile = await controller.evaluateCandidatePotential(resumeText);

          const profileJsonPath = path.join(process.cwd(), 'user_data', 'profile.json');
          await fs.writeFile(profileJsonPath, JSON.stringify(aiProfile, null, 2), 'utf-8');

          console.log(chalk.green(`[Sucesso]: Perfil IA atualizado e salvo em ${profileJsonPath}!`));
          console.log(chalk.cyan('\nResumo do Novo Perfil Identificado:'));
          console.log(chalk.white(`- Nível: ${aiProfile.seniority}`));
          console.log(chalk.white(`- Foco: ${aiProfile.primaryRole}`));
          console.log(chalk.white(`- Skills: ${aiProfile.skills.slice(0, 5).join(', ')}...`));
        } catch (error) {
          console.log(chalk.red(`\n[Erro]: Não foi possível processar o currículo: ${error.message}`));
          console.log(chalk.gray('Certifique-se de que os PDFs estão nas pastas user_data/resumes/ ou user_data/letters/\n'));
        }
        break;
      case 'report':
        console.log(chalk.cyan('\n[Relatórios]: Selecione o relatório que deseja visualizar/abrir:'));
        const { reportChoice } = await inquirer.prompt([
          {
            type: 'rawlist',
            name: 'reportChoice',
            message: 'Qual relatório você deseja abrir?',
            choices: [
              { name: '🟢 1. Vagas Aprovadas', value: 'vagas_aprovadas.md' },
              { name: '☢️ 2. Vagas em Quarentena', value: 'vagas_quarentena.md' },
              { name: '🛑 3. Vagas Descartadas', value: 'vagas_descartadas.md' },
              { name: '⬅️ 4. Voltar ao Menu', value: 'voltar' }
            ]
          }
        ]);

        if (reportChoice === 'voltar') break;

        const targetReportPath = path.join(process.cwd(), 'data', 'reports', reportChoice);
        await controller.refreshAllReports();

        console.log(chalk.green(`\n[Sucesso]: Abrindo arquivo ${targetReportPath}...`));
        const sysPlatform = process.platform;
        let cmd = sysPlatform === 'win32' ? `start "" "${targetReportPath}"` : sysPlatform === 'darwin' ? `open "${targetReportPath}"` : `xdg-open "${targetReportPath}"`;
        exec(cmd, (err) => {
          if (err) {
            console.log(chalk.yellow(`Arquivo localizado em: ${targetReportPath}`));
          }
        });
        break;

      case 'status':
        console.log(chalk.green(`\n[Status]: Módulos operacionais: ${status.modules.join(', ')}\n`));
        break;
      case 'exit':
        console.log(chalk.magenta('\nAté logo! 👋\n'));
        try {
          // Força a morte do processo Pai (O Vigia/Watcher do modo Dev) para não prender o usuário
          process.kill(process.ppid, 'SIGKILL');
        } catch (e) {}
        process.exit(0);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch((err) => {
    if (err.name === 'ExitPromptError') {
      console.log(chalk.magenta('\nSessão encerrada pelo usuário (Ctrl+C). Até mais! 👋\n'));
      process.exit(0);
    } else {
      console.error(chalk.red('\n[Erro Fatal no CLI]:'), err);
    }
  });
}
