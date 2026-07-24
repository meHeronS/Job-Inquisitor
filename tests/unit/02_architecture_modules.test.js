import { JobController } from '../../src/controllers/jobController.js';

export async function runTest() {
  const controller = new JobController();
  const status = controller.getSystemStatus();
  if (status.modules.length !== 16) {
    throw new Error(`Arquitetura incompleta: esperados 16 módulos, encontrados ${status.modules.length}`);
  }
  return `Arquitetura íntegra. (${status.modules.length} módulos injetados).`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
