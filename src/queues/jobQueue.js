import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Gerenciador de Filas Assíncronas para Varredura Noturna e Avaliação de Vagas (BullMQ).
 * SRP: Enfileirar vagas e processar em lote em segundo plano sem travar a aplicação.
 */
export class JobQueueManager {
  constructor(queueName = 'job-seek-processing-queue') {
    this.queueName = queueName;
    this.redisConnection = getRedisClient();
    this.queue = null;
    this.worker = null;
  }

  /**
   * Inicializa a fila do BullMQ com conexão Redis.
   */
  initQueue() {
    if (!this.queue) {
      this.queue = new Queue(this.queueName, {
        connection: this.redisConnection,
      });
      logger.info(`[Queue]: Fila assíncrona '${this.queueName}' inicializada.`);
    }
    return this.queue;
  }

  /**
   * Enfileira uma tarefa de processamento de vaga para a execução noturna.
   * @param {Object} jobPayload - Dados da vaga para raspagem/avaliação
   */
  async addJobToQueue(jobPayload) {
    const queue = this.initQueue();
    const job = await queue.add('evaluate-job', jobPayload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
    logger.info(`[Queue]: Vaga '${jobPayload.title || 'Vaga'}' adicionada à fila (ID: ${job.id}).`);
    return job;
  }

  /**
   * Inicializa o Worker do BullMQ para processar os trabalhos em lote em segundo plano.
   * @param {Function} processHandler - Função que executa a IA e persiste no MongoDB
   */
  startWorker(processHandler) {
    if (!this.worker) {
      this.worker = new Worker(
        this.queueName,
        async (job) => {
          logger.info(`[Worker]: Processando vaga enfileirada: ${job.data.title}`);
          return await processHandler(job.data);
        },
        { connection: this.redisConnection, concurrency: 2 }
      );

      this.worker.on('completed', (job) => {
        logger.info(`[Worker]: Vaga '${job.data.title}' avaliada com sucesso!`);
      });

      this.worker.on('failed', (job, err) => {
        logger.error(`[Worker]: Falha no processamento da vaga '${job?.data?.title}'`, err);
      });
    }
  }
}
