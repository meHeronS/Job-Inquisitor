import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';

const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'test-execution.log');

async function logMessage(message, colorFunc = chalk.white) {
  console.log(colorFunc(message));
  try {
    const cleanMsg = message.replace(/\x1B\[[0-9;]*m/g, '');
    await fs.appendFile(LOG_FILE_PATH, cleanMsg + '\n');
  } catch {}
}

async function runTestSuite() {
  const startTime = new Date().toLocaleString('pt-BR');
  await fs.mkdir(path.dirname(LOG_FILE_PATH), { recursive: true });
  await fs.writeFile(LOG_FILE_PATH, `=== LOG DE EXECUÇÃO DOS TESTES - ${startTime} ===\n\n`);

  await logMessage('====================================================', chalk.cyan);
  await logMessage('🕵️‍♂️  JOB INQUISITOR - SUÍTE MODULAR DE TESTES', chalk.cyan);
  await logMessage(`Data da Execução: ${startTime}`, chalk.gray);
  await logMessage('====================================================\n', chalk.cyan);

  const unitDir = path.join(process.cwd(), 'tests', 'unit');
  const integrationDir = path.join(process.cwd(), 'tests', 'integration');

  const unitFiles = (await fs.readdir(unitDir)).filter(f => f.endsWith('.test.js')).sort();
  const integrationFiles = (await fs.readdir(integrationDir)).filter(f => f.endsWith('.test.js')).sort();

  let passed = 0;
  let failed = 0;

  await logMessage('📦 [TESTES UNITÁRIOS]:', chalk.yellow);
  for (const file of unitFiles) {
    const filePath = path.join(unitDir, file);
    await logMessage(`\n▶ Rodando: tests/unit/${file}...`, chalk.cyan);
    try {
      const module = await import(`file://${filePath}`);
      const resultMsg = await module.runTest();
      await logMessage(`[✅ APROVADO] - ${resultMsg}`, chalk.green);
      passed++;
    } catch (err) {
      await logMessage(`[❌ FALHA CRÍTICA] - ${err.message}`, chalk.red);
      failed++;
    }
  }

  await logMessage('\n----------------------------------------------------', chalk.gray);
  await logMessage('🔗 [TESTES DE INTEGRAÇÃO]:', chalk.yellow);
  for (const file of integrationFiles) {
    const filePath = path.join(integrationDir, file);
    await logMessage(`\n▶ Rodando: tests/integration/${file}...`, chalk.cyan);
    try {
      const module = await import(`file://${filePath}`);
      const resultMsg = await module.runTest();
      await logMessage(`[✅ APROVADO] - ${resultMsg}`, chalk.green);
      passed++;
    } catch (err) {
      await logMessage(`[❌ FALHA CRÍTICA] - ${err.message}`, chalk.red);
      failed++;
    }
  }

  await logMessage('\n====================================================', chalk.cyan);
  await logMessage('📊 RESUMO DA AUDITORIA MODULAR:', chalk.cyan);
  await logMessage(`   ✅ Aprovados: ${passed}`, chalk.green);
  await logMessage(`   ❌ Falhas:    ${failed}`, failed > 0 ? chalk.red : chalk.green);
  await logMessage('====================================================\n', chalk.cyan);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error(chalk.red('\n[Erro Fatal no Test Runner]:'), err);
  process.exit(1);
});
