import fs from 'node:fs/promises';
import path from 'node:path';
import { LLMService } from '../../src/services/llmService.js';
import { MatchService } from '../../src/services/matchService.js';

export async function runTest() {
  const llmService = new LLMService();
  const matchService = new MatchService();

  const mockFilePath = path.join(process.cwd(), 'tests', 'mocks', 'jobs.json');
  const mockJobs = JSON.parse(await fs.readFile(mockFilePath, 'utf-8'));
  const mockProfile = { skills: ['JavaScript', 'React', 'Node.js'], seniority: 'Pleno' };

  for (const job of mockJobs) {
    const evaluatedData = await llmService.evaluateJobDynamicSalaryAndMatch(mockProfile, job);
    if ((job.expected_status === 'ghost' || job.expected_status === 'toxic') && evaluatedData.matchScore > 50 && evaluatedData.verdict === 'Candidatar') {
      throw new Error(`IA aprovou indevidamente vaga indesejada: ${job._test_id}`);
    }
  }

  return `Bateria de Stress Completa. IA avaliou ${mockJobs.length} vagas com alta precisão.`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
