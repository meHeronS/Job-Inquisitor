import { ApplicationTrackingService } from '../../src/services/applicationTrackingService.js';

export async function runTest() {
  const db = new ApplicationTrackingService();
  await db._clearDB();

  await db.trackApplication({ id: 'VAGA_01', title: 'Dev Backend', company: 'Google' }, 'Nova Vaga');
  await db.trackApplication({ id: 'VAGA_02', title: 'Dev Frontend', company: 'Microsoft' }, 'Aguardando Retorno');

  await db.updateStatusByCompany('Google', 'Recusado');
  await db.updateStatusByCompany('Microsoft', 'Entrevista');

  const metrics = await db.getPipelineMetrics();
  if (metrics.entrevistas !== 1 || metrics.recusas !== 1) {
    throw new Error('Falha na sincronização Kanban do ATS.');
  }

  return 'Kanban sincronizado! Google (Recusa), Microsoft (Entrevista).';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
