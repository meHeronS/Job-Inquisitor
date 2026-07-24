import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function parseEmailAccounts() {
  if (process.env.EMAIL_ACCOUNTS_JSON) {
    try {
      return JSON.parse(process.env.EMAIL_ACCOUNTS_JSON);
    } catch {
      console.warn('[Env]: Falha ao interpretar EMAIL_ACCOUNTS_JSON. Usando lista padrão.');
    }
  }

  const accounts = [];

  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    accounts.push({
      name: 'Gmail',
      host: process.env.GMAIL_HOST || 'imap.gmail.com',
      port: parseInt(process.env.GMAIL_PORT || '993', 10),
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    });
  }

  if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
    accounts.push({
      name: 'Outlook',
      host: process.env.OUTLOOK_HOST || 'outlook.office365.com',
      port: parseInt(process.env.OUTLOOK_PORT || '993', 10),
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASS,
    });
  }

  return accounts;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/job-seek',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  llm: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b' // Atualizado para o modelo de alta performance sugerido
  },
  emailAccounts: parseEmailAccounts(),
};
