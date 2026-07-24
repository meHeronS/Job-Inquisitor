import { LLMService } from '../../src/services/llmService.js';

export async function runTest() {
  const llmService = new LLMService();
  const profile = { seniority: 'Sênior', primaryRole: 'Desenvolvedor React', skills: ['React', 'Node.js'] };
  const job = { title: 'Dev Front', company: 'Tech' };
  const response = await llmService.generateTailoredCoverLetterOrAnswer(profile, job, 'Qual sua experiência?');

  if (!response || response.length < 10) {
    throw new Error('Copiloto gerou resposta vazia.');
  }
  return `Copiloto gerou resposta com base no perfil (Tamanho: ${response.length} caracteres).`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
