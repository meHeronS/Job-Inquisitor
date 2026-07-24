import { ApplicationTrackingService } from '../../src/services/applicationTrackingService.js';

export async function runTest() {
  const db = new ApplicationTrackingService();
  await db._clearDB();

  await db.trackApplication({ id: 'VAGA_QUAR', title: 'Dev Suspeito', company: 'Ghost Inc' }, 'Quarentena');
  const quarApps = await db.getQuarantinedApplications();
  if (quarApps.length !== 1) {
    throw new Error('Vaga em quarentena não foi registrada corretamente.');
  }

  await db.updateStatusById('VAGA_QUAR', 'Aguardando Retorno', 'Resgate manual');
  const mainApps = await db.getAllApplications();
  if (mainApps.length !== 1) {
    throw new Error('Vaga resgatada da quarentena não foi movida para applications.json.');
  }

  return 'Fluxo de Quarentena validado! Vaga resgatada via Override com sucesso.';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
