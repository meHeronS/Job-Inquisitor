import fs from 'node:fs';
import path from 'node:path';

/**
 * Utilitário de Logger estruturado para execuções em segundo plano (Overnight Batch).
 * SRP: Registrar logs limpos no console e no arquivo logs/app.log.
 */
class Logger {
  constructor() {
    this.logsDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    this.logFile = path.join(this.logsDir, 'app.log');
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  info(message) {
    const formatted = this.formatMessage('info', message);
    console.log(formatted);
    fs.appendFileSync(this.logFile, formatted + '\n');
  }

  warn(message) {
    const formatted = this.formatMessage('warn', message);
    console.warn(formatted);
    fs.appendFileSync(this.logFile, formatted + '\n');
  }

  error(message, errorObj = null) {
    const errorDetails = errorObj ? ` - ${errorObj.stack || errorObj.message}` : '';
    const formatted = this.formatMessage('error', `${message}${errorDetails}`);
    console.error(formatted);
    fs.appendFileSync(this.logFile, formatted + '\n');
  }
}

export const logger = new Logger();
