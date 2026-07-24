import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { JobController } from '../controllers/jobController.js';

const controller = new JobController();

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

  const status = controller.getSystemStatus();
  console.log(chalk.green(`[Status]: Sistema operacional (${status.timestamp})`));
  console.log(chalk.gray(`[Módulos Carregados]: ${status.modules.join(', ')}\n`));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Selecione um módulo para iniciar:',
      choices: [
        { name: '🕵️‍♂️  Iniciar Investigação Automática (Caçar Vagas)', value: 'hunt' },
        { name: '💬  Chat: Copiloto Interativo (Ajuda com Formulários)', value: 'chat' },
        { name: '📝  Registrar Candidatura Manual (Para Rastreio)', value: 'manual' },
        { name: '📩  Sincronizar E-mails e Status de Vagas (Gmail / Outlook)', value: 'email' },
        { name: '🤖  Gerar Perfil de Candidato (Extrair do PDF)', value: 'profile' },
        { name: '📊  Ver Relatório VIP', value: 'report' },
        { name: '⚙️  Status do Sistema', value: 'status' },
        { name: '🚪  Sair', value: 'exit' }
      ]
    },
  ]);

  switch (answers.action) {
    case 'hunt':
      console.log(chalk.yellow('\n[Info]: Módulo de Investigação e Raspagem Universal ativado.\n'));
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

    case 'email':
      console.log(chalk.blue('\n[Info]: Módulo EmailService pronto para parsing de recusas e convites de entrevista.'));
      
      const emailAnswers = await inquirer.prompt([
        {
          type: 'list',
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
      
      const profileAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'pdfName',
          message: 'Qual é o nome do seu currículo em PDF na pasta user_data? (Ex: curriculo.pdf)',
          default: 'curriculo.pdf'
        }
      ]);

      const pdfPath = path.join(process.cwd(), 'user_data', profileAnswers.pdfName);
      
      try {
        console.log(chalk.blue(`\n[Info]: Lendo arquivo PDF em ${pdfPath}...`));
        const resumeText = await controller.readResumePdf(pdfPath);
        console.log(chalk.green(`[Sucesso]: Texto extraído com sucesso! (${resumeText.length} caracteres encontrados)`));
        
        console.log(chalk.yellow('[IA]: Analisando o perfil e extraindo habilidades e senioridade...'));
        const aiProfile = await controller.evaluateCandidatePotential(resumeText);
        
        const profileJsonPath = path.join(process.cwd(), 'user_data', 'profile.json');
        await fs.writeFile(profileJsonPath, JSON.stringify(aiProfile, null, 2), 'utf-8');
        
        console.log(chalk.green(`[Sucesso]: Perfil IA gerado e salvo em ${profileJsonPath}!`));
        console.log(chalk.cyan('\nResumo do Perfil Identificado:'));
        console.log(chalk.white(`- Nível: ${aiProfile.seniority}`));
        console.log(chalk.white(`- Foco: ${aiProfile.primaryRole}`));
        console.log(chalk.white(`- Skills: ${aiProfile.skills.slice(0, 5).join(', ')}...`));
      } catch (error) {
        console.log(chalk.red(`\n[Erro]: Não foi possível processar o currículo: ${error.message}`));
        console.log(chalk.gray('Certifique-se de que o arquivo realmente existe na pasta user_data/\n'));
      }
      break;
    case 'status':
      console.log(chalk.green(`\n[Status]: Módulos operacionais: ${status.modules.join(', ')}\n`));
      break;
    case 'exit':
      console.log(chalk.magenta('\nAté logo! 👋\n'));
      process.exit(0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch((err) => {
    console.error(chalk.red('Erro na execução do CLI:'), err);
  });
}
