import { MatchService } from '../../src/services/matchService.js';

export async function runTest() {
  const matchService = new MatchService();
  const profile = { skills: ['Node.js', 'React', 'JavaScript'], seniority: 'Pleno' };
  const job = { title: 'Desenvolvedor Fullstack Node/React', description: 'Buscamos dev com Node.js e React.' };

  const res = matchService.evaluateMatch(profile, job);
  if (res.matchScore < 50) {
    throw new Error(`MatchScore anormalmente baixo: ${res.matchScore}%`);
  }
  return `MatchService cruzou perfil e vaga com sucesso (Score: ${res.matchScore}%).`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
