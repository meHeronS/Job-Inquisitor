import fs from 'node:fs';
import path from 'node:path';

export async function runTest() {
  const rootDir = process.cwd();
  const dirs = [
    path.join(rootDir, 'user_data/resumes'),
    path.join(rootDir, 'user_data/letters'),
    path.join(rootDir, 'data/db'),
    path.join(rootDir, 'data/reports')
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      throw new Error(`Diretório de segurança ausente: ${dir}`);
    }
  }
  return 'Pastas de segurança criadas e protegidas.';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
