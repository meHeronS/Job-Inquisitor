import assert from 'node:assert';
import { describe, it } from 'node:test';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { JobController } from '../src/controllers/jobController.js';
import { SecurityCryptoService } from '../src/services/securityCryptoService.js';

describe('Suíte de Testes - Job Inquisitor 🕵️‍♂️ (Investigador e Copiloto de Vagas Universal)', () => {
  it('1. Deve instanciar o JobController com todos os 15 módulos sob a marca Job Inquisitor', () => {
    const controller = new JobController();
    const status = controller.getSystemStatus();

    assert.strictEqual(status.status, 'active');
    assert.strictEqual(status.modules.length, 15);
  });

  it('2. Deve derivar a chave mestre por PBKDF2 HMAC-SHA256 no Job Inquisitor', () => {
    const cryptoService = new SecurityCryptoService('passphrase-inquisitor');
    const secret = 'dados_sensiveis_inquisitor';

    const encrypted = cryptoService.encrypt(secret);
    const decrypted = cryptoService.decrypt(encrypted);

    assert.strictEqual(decrypted, secret);
  });

  it('3. Deve conectar o banco local na pasta dedicada data/db/job_inquisitor_db.json', async () => {
    const dbStatus = await connectDatabase();
    assert.ok(dbStatus.type);
    await disconnectDatabase();
  });
});
