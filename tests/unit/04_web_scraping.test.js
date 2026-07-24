import { ScrapingService } from '../../src/services/scrapingService.js';

export async function runTest() {
  const scrapingService = new ScrapingService();
  const scrapedJobs = await scrapingService.scrapeJobs('Dev', 'Remoto', 5);
  if (!scrapedJobs || scrapedJobs.length === 0) {
    throw new Error('ScrapingService retornou array vazio.');
  }
  return `ScrapingService obteve dados corretamente (${scrapedJobs.length} vagas simuladas/extraídas).`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().then(msg => console.log(`[✅ APROVADO] - ${msg}`)).catch(err => console.error(`[❌ FALHA] - ${err.message}`));
}
