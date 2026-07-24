import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { config } from './env.js';

const localDbPath = path.resolve(process.cwd(), 'data/db/job_inquisitor_db.json');

/**
 * Módulo de Conexão com o Banco de Dados com Estratégia Dupla e Resiliente (Dual DB Engine).
 * SRP: Tenta conectar no MongoDB local. Se o Docker não estiver ligado,
 * fallback para o banco local em arquivo armazenado na pasta isolada data/db/job_inquisitor_db.json.
 */
export async function connectDatabase() {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database]: MongoDB conectado com sucesso em ${conn.connection.host}`);
    return { type: 'MongoDB', connection: conn };
  } catch {
    console.log('[Database]: Docker/MongoDB não detectado. Ativando Banco Local em data/db/job_inquisitor_db.json.');
    
    try {
      await fs.access(localDbPath);
    } catch {
      await fs.mkdir(path.dirname(localDbPath), { recursive: true });
      await fs.writeFile(localDbPath, JSON.stringify({ jobs: [], settings: {} }, null, 2));
    }

    return { type: 'EmbeddedLocalFileDB', filePath: localDbPath };
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database]: Conexão com MongoDB encerrada.');
  }
}
