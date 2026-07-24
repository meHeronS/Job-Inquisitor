import crypto from 'node:crypto';

/**
 * Service responsável por identificar e mesclar vagas duplicadas com alta precisão.
 * SRP: Distinguir vagas idênticas de vagas genuinamente diferentes na mesma empresa (ex: Squads diferentes ou IDs distintos).
 */
export class DeduplicationService {
  constructor() {
    this.seenHashes = new Set();
  }

  isDuplicate(job) {
    const hash = this.generateJobHash(job);
    return this.seenHashes.has(hash);
  }

  markAsProcessed(job) {
    const hash = this.generateJobHash(job);
    this.seenHashes.add(hash);
  }

  /**
   * Gera um hash único baseado no Link de Destino Final ou (Empresa + Título + Localização + Código da Vaga).
   */
  generateJobHash(job = {}) {
    // Se existir a URL de destino final (ex: Eightfold/Gupy), essa é a chave primária de deduplicação
    if (job.externalRedirectUrl) {
      return crypto.createHash('sha256').update(job.externalRedirectUrl.trim().toLowerCase()).digest('hex');
    }

    const company = (job.company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const title = (job.title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const location = (job.location || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const rawString = `${company}_${title}_${location}`;

    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Remove apenas duplicatas reais, preservando oportunidades distintas na mesma empresa.
   */
  deduplicateJobs(jobsList = []) {
    const seenHashes = new Map();

    for (const job of jobsList) {
      const hash = this.generateJobHash(job);

      if (!seenHashes.has(hash)) {
        seenHashes.set(hash, { ...job });
      } else {
        // Se a vaga já existe na lista, atualiza registros mesclando fontes de origem
        const existingJob = seenHashes.get(hash);
        if (job.source && !existingJob.source.includes(job.source)) {
          existingJob.source = `${existingJob.source} / ${job.source}`;
        }
      }
    }

    return Array.from(seenHashes.values());
  }
}
