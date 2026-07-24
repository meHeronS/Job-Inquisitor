import { LLMService } from '../../src/services/llmService.js';

export async function runTest() {
  const llmService = new LLMService();
  const mockResume = "Sou Desenvolvedor Sênior com 10 anos de experiência em React, Node, SQL e AWS.";
  const profile = await llmService.analyzeCandidatePotential(mockResume);

  if (!profile || !profile.primaryRole || !profile.toneOfVoice) {
    throw new Error('Perfil do candidato gerado com estrutura incompleta.');
  }
  return `O motor gerou o Perfil 360º com sucesso (Role: ${profile.primaryRole}) e detectou o Tom de Voz: ${profile.toneOfVoice}.`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
