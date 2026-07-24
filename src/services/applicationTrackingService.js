import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Service responsável por atuar como um ATS (Applicant Tracking System) Local.
 * Gerencia bancos de dados JSON estruturados dentro da pasta data/db/:
 *  - applications.json: Vagas Aprovadas / VIP ('Nova Vaga', 'Aguardando Retorno', 'Entrevista', 'Recusado')
 *  - quarantine.json: Vagas retidas para revisão de falsos positivos
 *  - ignored.json: Vagas descartadas pela IA (usado para deduplicação)
 */
export class ApplicationTrackingService {
  constructor() {
    this.dbDir = path.join(process.cwd(), 'data', 'db');
    this.dbPath = path.join(this.dbDir, 'applications.json');
    this.quarantineDbPath = path.join(this.dbDir, 'quarantine.json');
    this.ignoredDbPath = path.join(this.dbDir, 'ignored.json');
    this.initDB();
  }

  async initDB() {
    try {
      await fs.mkdir(this.dbDir, { recursive: true });

      // Migração automática se existir o data/applications.json antigo
      const oldLegacyPath = path.join(process.cwd(), 'data', 'applications.json');
      try {
        await fs.access(oldLegacyPath);
        const legacyData = await fs.readFile(oldLegacyPath, 'utf-8');
        if (legacyData && legacyData !== '[]') {
          await fs.writeFile(this.dbPath, legacyData, 'utf-8');
        }
      } catch {
        // Sem legado antigo
      }

      await this._ensureFile(this.dbPath);
      await this._ensureFile(this.quarantineDbPath);
      await this._ensureFile(this.ignoredDbPath);
    } catch {
      // Ignore
    }
  }

  async _ensureFile(filePath) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify([]), 'utf-8');
    }
  }

  async _readDB(filePath = this.dbPath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async _writeDB(data, filePath = this.dbPath) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAllApplications() {
    return await this._readDB(this.dbPath);
  }

  async getQuarantinedApplications() {
    return await this._readDB(this.quarantineDbPath);
  }

  async getIgnoredApplications() {
    return await this._readDB(this.ignoredDbPath);
  }

  /**
   * Retorna TODAS as vagas de todos os bancos (applications, quarantine, ignored)
   * para deduplicação instantânea sem re-analisar.
   */
  async getAllHistoricJobs() {
    const apps = await this._readDB(this.dbPath);
    const quar = await this._readDB(this.quarantineDbPath);
    const ign = await this._readDB(this.ignoredDbPath);
    return [...apps, ...quar, ...ign];
  }

  /**
   * Adiciona uma nova candidatura ao banco de dados local apropriado.
   */
  async trackApplication(jobData, status = 'Aguardando Retorno') {
    let targetPath = this.dbPath;
    if (status === 'Quarentena') {
      targetPath = this.quarantineDbPath;
    } else if (status === 'Ignorado') {
      targetPath = this.ignoredDbPath;
    }

    const db = await this._readDB(targetPath);
    
    // Evita duplicatas se já foi rastreada neste banco
    const exists = db.find(app => (app.jobId === jobData.id || app.id === jobData.id) || (app.company === jobData.company && app.title === jobData.title));
    if (exists) return false;

    const newApp = {
      id: jobData.id || `JOB_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      url: jobData.url,
      externalRedirectUrl: jobData.externalRedirectUrl || jobData.url,
      source: jobData.source || 'LinkedIn Jobs',
      appliedAt: new Date().toISOString(),
      status: status,
      reason: jobData.reason || jobData.formattedReport || '',
      matchScore: jobData.matchScore || 0,
      history: [
        { status, timestamp: new Date().toISOString() }
      ]
    };

    db.push(newApp);
    await this._writeDB(db, targetPath);
    return newApp;
  }

  /**
   * Atualiza o status de uma vaga rastreada baseada na empresa (Usado pelo EmailService).
   */
  async updateStatusByCompany(companyName, newStatus, reason = '') {
    const db = await this._readDB(this.dbPath);
    const companyLower = companyName.toLowerCase();
    
    let updated = false;
    for (const app of db) {
      if ((app.status === 'Aguardando Retorno' || app.status === 'Nova Vaga') && app.company.toLowerCase().includes(companyLower)) {
        app.status = newStatus;
        app.history.push({ status: newStatus, reason, timestamp: new Date().toISOString() });
        updated = true;
      }
    }

    if (updated) {
      await this._writeDB(db, this.dbPath);
    }
    return updated;
  }

  /**
   * Atualiza status pelo ID (Usado no override da Quarentena ou atualização CLI).
   */
  async updateStatusById(jobId, newStatus, reason = '') {
    // Procura primeiro em applications.json
    let db = await this._readDB(this.dbPath);
    let app = db.find(a => a.id === jobId);

    if (app) {
      app.status = newStatus;
      app.history.push({ status: newStatus, reason, timestamp: new Date().toISOString() });
      await this._writeDB(db, this.dbPath);
      return true;
    }

    // Se estiver em Quarentena e mover para Nova Vaga/Aguardando Retorno
    let quarDb = await this._readDB(this.quarantineDbPath);
    const quarIndex = quarDb.findIndex(a => a.id === jobId);
    if (quarIndex !== -1) {
      const movedItem = quarDb.splice(quarIndex, 1)[0];
      await this._writeDB(quarDb, this.quarantineDbPath);

      movedItem.status = newStatus;
      movedItem.history.push({ status: newStatus, reason: reason || 'Resgatado da Quarentena', timestamp: new Date().toISOString() });

      const mainDb = await this._readDB(this.dbPath);
      mainDb.push(movedItem);
      await this._writeDB(mainDb, this.dbPath);
      return true;
    }

    return false;
  }

  /**
   * Deleta uma candidatura fisicamente do banco de dados.
   */
  async deleteApplication(jobId) {
    let db = await this._readDB(this.dbPath);
    const initialLength = db.length;
    db = db.filter(app => app.id !== jobId);
    
    if (db.length !== initialLength) {
      await this._writeDB(db, this.dbPath);
      return true;
    }
    return false;
  }

  /**
   * Retorna as candidaturas agrupadas por status.
   */
  async getPipelineMetrics() {
    const db = await this._readDB(this.dbPath);
    return {
      novas: db.filter(app => app.status === 'Nova Vaga').length,
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
    await this._writeDB([], this.dbPath);
    await this._writeDB([], this.quarantineDbPath);
    await this._writeDB([], this.ignoredDbPath);
  }
}
