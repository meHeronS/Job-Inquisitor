import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { JobController } from '../src/controllers/jobController.js';
import { runDirectoryCleanup } from '../src/utils/cleanup.js';

describe('Suíte de Testes - Job Inquisitor (Autocriação Defensiva de Pastas & Regras Git)', () => {
  it('1. Deve autocriar as pastas user_data/, data/, logs/ e tests/logs/ com arquivos .gitkeep defensivamente', () => {
    runDirectoryCleanup();

    const rootDir = process.cwd();
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'user_data/resumes/.gitkeep')), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'user_data/letters/.gitkeep')), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'user_data/sessions/.gitkeep')), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'data/db/.gitkeep')), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'data/reports/.gitkeep')), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'logs/.gitkeep')), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, 'tests/logs/.gitkeep')), true);
  });

  it('2. Deve inicializar o JobController com os 16 módulos operacionais sem erros', () => {
    const controller = new JobController();
    const status = controller.getSystemStatus();

    assert.strictEqual(status.status, 'active');
    assert.strictEqual(status.modules.length, 16);
  });
});
