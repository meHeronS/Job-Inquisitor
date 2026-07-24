import fs from 'node:fs';
import path from 'node:path';

/**
 * Script limpo e essencial para autocriar a estrutura de diretórios do usuário de forma defensiva.
 * Executar via terminal: npm run clean-dirs ou node src/utils/cleanup.js
 */
export function runDirectoryCleanup() {
  const rootDir = path.resolve(process.cwd());
  const resumesDir = path.join(rootDir, 'user_data/resumes');
  const lettersDir = path.join(rootDir, 'user_data/letters');
  const sessionsDir = path.join(rootDir, 'user_data/sessions');
  const dbDir = path.join(rootDir, 'data/db');
  const reportsDir = path.join(rootDir, 'data/reports');
  const logsDir = path.join(rootDir, 'logs');
  const testLogsDir = path.join(rootDir, 'tests/logs');

  // Autocriação defensiva da estrutura de diretórios do usuário e logs de teste
  [resumesDir, lettersDir, sessionsDir, dbDir, reportsDir, logsDir, testLogsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      const gitkeepPath = path.join(dir, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '# Pasta preservada para o sistema\n');
      }
    }
  });

  // Limpeza de arquivo legado fora da pasta data/db/
  const legacyAppJson = path.join(rootDir, 'data/applications.json');
  if (fs.existsSync(legacyAppJson)) {
    try {
      fs.unlinkSync(legacyAppJson);
    } catch {
      // Ignora erro se estiver em uso
    }
  }
}

// Executar na inicialização
runDirectoryCleanup();
