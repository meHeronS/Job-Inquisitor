import { DeduplicationService } from '../../src/services/deduplicationService.js';

export async function runTest() {
  const dedup = new DeduplicationService();
  const job1 = { title: 'Engenheiro de Software', company: 'TechCorp', location: 'Remoto', url: 'https://example.com/1' };
  const job2 = { title: 'Engenheiro de Software', company: 'TechCorp', location: 'Remoto', url: 'https://example.com/1' };

  dedup.markAsProcessed(job1);
  const isDuplicate = dedup.isDuplicate(job2);

  if (!isDuplicate) {
    throw new Error('Falha na detecção de vaga duplicada.');
  }
  return 'DeduplicationService identificou e mesclou as duplicatas perfeitamente.';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
