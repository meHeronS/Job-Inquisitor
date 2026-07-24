import fs from 'node:fs';
import path from 'node:path';

/**
 * Script defensivo para autocriar a estrutura de diretórios do usuário e limpar pastas obsoletas.
 * Executar via terminal: npm run clean-dirs ou node src/utils/cleanup.js
 */
export function runDirectoryCleanup() {
  const rootDir = path.resolve(process.cwd());
  const docsPrivateDir = path.join(rootDir, 'docs/private');
  const srcTestsDir = path.join(rootDir, 'src/tests');
  const resumesDir = path.join(rootDir, 'user_data/resumes');
  const lettersDir = path.join(rootDir, 'user_data/letters');
  const sessionsDir = path.join(rootDir, 'user_data/sessions');
  const dbDir = path.join(rootDir, 'data/db');
  const reportsDir = path.join(rootDir, 'data/reports');
  const logsDir = path.join(rootDir, 'logs');

  // Autocriação defensiva de 100% dos diretórios necessários no primeiro milissegundo
  [resumesDir, lettersDir, sessionsDir, dbDir, reportsDir, logsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      // Criar .gitkeep se a pasta acabou de ser gerada
      const gitkeepPath = path.join(dir, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '# Pasta preservada para o sistema\n');
      }
    }
  });

  // Mover PDFs de docs/private para user_data/ se existirem
  if (fs.existsSync(docsPrivateDir)) {
    const files = fs.readdirSync(docsPrivateDir);
    for (const file of files) {
      const srcFile = path.join(docsPrivateDir, file);
      const stat = fs.statSync(srcFile);

      if (stat.isFile() && file.endsWith('.pdf')) {
        const lowerName = file.toLowerCase();
        if (lowerName.includes('carta') || lowerName.includes('cover')) {
          const destFile = path.join(lettersDir, file);
          fs.copyFileSync(srcFile, destFile);
        } else {
          const destFile = path.join(resumesDir, file);
          fs.copyFileSync(srcFile, destFile);
        }
      }
    }

    fs.rmSync(docsPrivateDir, { recursive: true, force: true });
  }

  // Deletar pasta duplicada obsoleto src/tests se existir
  if (fs.existsSync(srcTestsDir)) {
    fs.rmSync(srcTestsDir, { recursive: true, force: true });
  }
}

// Executar na inicialização ou chamada via linha de comando
runDirectoryCleanup();
