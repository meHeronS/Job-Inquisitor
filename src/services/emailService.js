import { SecurityCryptoService } from './securityCryptoService.js';

/**
 * Service responsável por monitorar as caixas de e-mails via OAuth 2.0 (Google Gmail & Microsoft Outlook).
 * SRP: Conecta de forma segura usando RefreshTokens OAuth 2.0 criptografados (sem senha mestre), lê e-mails e atualiza status.
 */
export class EmailService {
  constructor(accounts = [], securityCryptoService = new SecurityCryptoService()) {
    this.accounts = accounts;
    this.securityCryptoService = securityCryptoService;
  }

  /**
   * Configuração de permissão OAuth 2.0 para acesso de leitura de e-mails.
   */
  getOAuthConsentConfig() {
    return {
      googleOAuth: {
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        grantType: 'authorization_code',
        accessType: 'offline', // Garante o RefreshToken para acesso ilimitado em segundo plano
      },
      microsoftOAuth: {
        scope: 'https://outlook.office.com/IMAP.AccessAsUser.All offline_access',
        grantType: 'authorization_code',
      },
    };
  }

  /**
   * Analisa o texto/assunto do e-mail recebido e classifica a resposta da empresa.
   */
  parseEmailFeedback(subject = '', body = '') {
    const text = `${subject} ${body}`.toLowerCase();

    const rejectionKeywords = [
      'infelizmente',
      'não seguiremos',
      'nao seguiremos',
      'outros candidatos',
      'processo encerrado',
      'não foi selecionado',
      'agradecemos seu interesse',
    ];

    const interviewKeywords = [
      'gostaríamos de agendar',
      'gostariamos de agendar',
      'convite para entrevista',
      'próxima etapa',
      'proxima etapa',
      'etapa técnica',
      'entrevista com o gestor',
    ];

    const isRejection = rejectionKeywords.some((kw) => text.includes(kw));
    const isInterview = interviewKeywords.some((kw) => text.includes(kw));

    if (isRejection) {
      return { status: 'rejected', reason: 'Palavra-chave de recusa identificada no e-mail' };
    }

    if (isInterview) {
      return { status: 'interview', reason: 'Convite para entrevista ou próxima etapa identificado' };
    }

    return { status: 'unknown', reason: 'Sem correspondência direta de status' };
  }
}
