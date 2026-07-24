import fs from 'node:fs';
import path from 'node:path';

/**
 * Script standalone para mover currículos/cartas de docs/private para user_data/ e deletar pastas obsoletas.
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

  console.log('\n🧹 Iniciando Organização e Limpeza de Diretórios...\n');

  // Garantir que as pastas de destino existam
  [resumesDir, lettersDir, sessionsDir, dbDir, reportsDir, logsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Mover PDFs de docs/private para user_data/
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
          console.log(` ✅ Copiado: ${file} -> user_data/letters/`);
        } else {
          const destFile = path.join(resumesDir, file);
          fs.copyFileSync(srcFile, destFile);
          console.log(` ✅ Copiado: ${file} -> user_data/resumes/`);
        }
      }
    }

    // Deletar pasta obsoleto docs/private
    fs.rmSync(docsPrivateDir, { recursive: true, force: true });
    console.log(' 🗑️  Pasta obsoleto docs/private removida com sucesso!');
  } else {
    console.log(' ℹ️  Pasta docs/private já havia sido removida.');
  }

  // Deletar pasta duplicada obsoleto src/tests se existir
  if (fs.existsSync(srcTestsDir)) {
    fs.rmSync(srcTestsDir, { recursive: true, force: true });
    console.log(' 🗑️  Pasta duplicada src/tests removida com sucesso!');
  }

  console.log('\n✨ Organização finalizada com 100% de sucesso!\n');
}

// Executar quando chamado diretamente via linha de comando
if (import.meta.url === `file://${process.argv[1]}`) {
  runDirectoryCleanup();
}
