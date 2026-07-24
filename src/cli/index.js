import chalk from 'chalk';
import inquirer from 'inquirer';
import { JobController } from '../controllers/jobController.js';

const controller = new JobController();

async function runCLI() {
  console.clear();
  console.log(chalk.bold.cyan('=================================================================='));
  console.log(chalk.bold.cyan('   🕵️‍♂️ Job Inquisitor: Investigador e Copiloto de Vagas Automático '));
  console.log(chalk.bold.gray('   Criado por Heron Silva (@meherons) | Open-Source Universal AI  '));
  console.log(chalk.bold.cyan('==================================================================\n'));

  const status = controller.getSystemStatus();
  console.log(chalk.green(`[Status]: Sistema operacional (${status.timestamp})`));
  console.log(chalk.gray(`[Módulos Carregados]: ${status.modules.join(', ')}\n`));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Escolha uma opção:',
      choices: [
        { name: '🔍 Coletar e Investigar Vagas (Qualquer Área Profissional)', value: 'search' },
        { name: '📩 Sincronizar E-mails e Status de Vagas (Gmail / Outlook)', value: 'email' },
        { name: '📄 Ver Perfil e Documentos Privados (PDF / LinkedIn)', value: 'profile' },
        { name: '📊 Ver Status dos Serviços & Métricas de Funil', value: 'status' },
        { name: '❌ Sair', value: 'exit' },
      ],
    },
  ]);

  switch (answers.action) {
    case 'search':
      console.log(chalk.yellow('\n[Info]: Módulo de Investigação e Raspagem Universal ativado.\n'));
      break;
    case 'email':
      console.log(chalk.blue('\n[Info]: Módulo EmailService pronto para parsing de recusas e convites de entrevista.\n'));
      break;
    case 'profile':
      console.log(chalk.magenta('\n[Segurança]: Seus documentos privados ficam salvos e isolados em user_data/ (Protegidos pelo Git).\n'));
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
