import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Service responsável por atuar como um ATS (Applicant Tracking System) Local.
 * Mantém o ciclo de vida da vaga: 'Aguardando Retorno', 'Entrevista', 'Recusado', 'Ignorado'.
 */
export class ApplicationTrackingService {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'applications.json');
    this.initDB();
  }

  async initDB() {
    try {
      await fs.access(this.dbPath);
    } catch {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      await fs.writeFile(this.dbPath, JSON.stringify([]), 'utf-8');
    }
  }

  async _readDB() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async _writeDB(data) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Adiciona uma nova candidatura ao banco de dados local.
   */
  async trackApplication(jobData, status = 'Aguardando Retorno') {
    const db = await this._readDB();
    
    // Evita duplicatas se já foi rastreada
    const exists = db.find(app => app.jobId === jobData.id || (app.company === jobData.company && app.title === jobData.title));
    if (exists) return false;

    const newApp = {
      id: jobData.id || `JOB_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: jobData.title,
      company: jobData.company,
      appliedAt: new Date().toISOString(),
      status: status,
      history: [
        { status, timestamp: new Date().toISOString() }
      ]
    };

    db.push(newApp);
    await this._writeDB(db);
    return newApp;
  }

  /**
   * Atualiza o status de uma vaga rastreada baseada na empresa (Usado pelo EmailService).
   */
  async updateStatusByCompany(companyName, newStatus, reason = '') {
    const db = await this._readDB();
    const companyLower = companyName.toLowerCase();
    
    let updated = false;
    for (const app of db) {
      if (app.status === 'Aguardando Retorno' && app.company.toLowerCase().includes(companyLower)) {
        app.status = newStatus;
        app.history.push({ status: newStatus, reason, timestamp: new Date().toISOString() });
        updated = true;
      }
    }

    if (updated) {
      await this._writeDB(db);
    }
    return updated;
  }

  /**
   * Retorna candidaturas em Quarentena.
   */
  async getQuarantinedApplications() {
    const db = await this._readDB();
    return db.filter(app => app.status === 'Quarentena');
  }

  /**
   * Atualiza status pelo ID (Usado no override da Quarentena).
   */
  async updateStatusById(jobId, newStatus, reason = '') {
    const db = await this._readDB();
    let updated = false;
    for (const app of db) {
      if (app.id === jobId) {
        app.status = newStatus;
        app.history.push({ status: newStatus, reason, timestamp: new Date().toISOString() });
        updated = true;
        break;
      }
    }
    if (updated) await this._writeDB(db);
    return updated;
  }

  /**
   * Deleta uma candidatura fisicamente do banco de dados.
   */
  async deleteApplication(jobId) {
    let db = await this._readDB();
    const initialLength = db.length;
    db = db.filter(app => app.id !== jobId);
    
    if (db.length !== initialLength) {
      await this._writeDB(db);
      return true;
    }
    return false;
  }

  /**
   * Retorna as candidaturas agrupadas por status.
   */
  async getPipelineMetrics() {
    const db = await this._readDB();
    return {
      aguardandoRetorno: db.filter(app => app.status === 'Aguardando Retorno').length,
      entrevistas: db.filter(app => app.status === 'Entrevista').length,
      recusas: db.filter(app => app.status === 'Recusado').length,
      total: db.length
    };
  }

  /**
   * Limpa o banco de dados (Usado para testes).
   */
  async _clearDB() {
    await this._writeDB([]);
  }
}
