import { SecurityCryptoService } from './securityCryptoService.js';

/**
 * Service responsável por monitorar as caixas de e-mails via OAuth 2.0 (Google Gmail & Microsoft Outlook).
 * SRP: Conecta de forma segura usando RefreshTokens OAuth 2.0 criptografados (sem senha mestre), lê e-mails e atualiza status.
 */
export class EmailService {
  constructor(accounts = [], securityCryptoService = new SecurityCryptoService(), applicationTrackingService = null) {
    this.accounts = accounts;
    this.securityCryptoService = securityCryptoService;
    this.applicationTrackingService = applicationTrackingService;
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
   * Gera a URL oficial de Consentimento (OAuth 2.0) para o provedor selecionado.
   * @param {string} provider 'google' ou 'microsoft'
   */
  generateOAuthUrl(provider) {
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID || 'COLOQUE_SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';
      const redirectUri = 'http://localhost:3000/oauth/callback';
      const scope = this.getOAuthConsentConfig().googleOAuth.scope;
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    } 
    
    if (provider === 'microsoft') {
      const clientId = process.env.MS_CLIENT_ID || 'COLOQUE_SEU_CLIENT_ID_AQUI';
      const redirectUri = 'http://localhost:3000/oauth/callback';
      const scope = this.getOAuthConsentConfig().microsoftOAuth.scope;
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${encodeURIComponent(scope)}`;
    }

    throw new Error('Provedor de E-mail não suportado.');
  }

  /**
   * Analisa o texto/assunto do e-mail recebido, classifica a resposta, 
   * extrai a empresa remetente e atualiza o Banco de Dados Local.
   */
  async parseEmailFeedbackAndSync(senderEmail = '', subject = '', body = '') {
    const text = `${subject} ${body}`.toLowerCase();
    
    // Extrai a empresa do domínio do e-mail (ex: rh@techcorp.com -> techcorp)
    // Em um cenário real, também pode extrair assinaturas do e-mail.
    let companyMatch = senderEmail.match(/@([a-zA-Z0-9.-]+)\./);
    let companyName = companyMatch ? companyMatch[1] : 'Desconhecida';
    if (companyName.toLowerCase() === 'gmail' || companyName.toLowerCase() === 'outlook') {
      // Se for domínio genérico, tenta extrair do assunto (Ex: "Processo Seletivo - StartUpX")
      const subjectMatch = subject.match(/(?:-|na|para a empresa)\s+([a-zA-Z0-9 ]+)/i);
      if (subjectMatch) companyName = subjectMatch[1].trim();
    }

    const rejectionKeywords = [
      'infelizmente', 'não seguiremos', 'nao seguiremos', 'outros candidatos',
      'processo encerrado', 'não foi selecionado', 'agradecemos seu interesse'
    ];
    const interviewKeywords = [
      'gostaríamos de agendar', 'gostariamos de agendar', 'convite para entrevista',
      'próxima etapa', 'proxima etapa', 'etapa técnica', 'entrevista com o gestor'
    ];

    const isRejection = rejectionKeywords.some((kw) => text.includes(kw));
    const isInterview = interviewKeywords.some((kw) => text.includes(kw));

    let resultStatus = 'unknown';
    let resultReason = 'Sem correspondência direta de status';

    if (isRejection) {
      resultStatus = 'Recusado';
      resultReason = 'Palavra-chave de recusa identificada no e-mail';
    } else if (isInterview) {
      resultStatus = 'Entrevista';
      resultReason = 'Convite para entrevista ou próxima etapa identificado';
    }

    let synced = false;
    if (resultStatus !== 'unknown' && this.applicationTrackingService) {
      synced = await this.applicationTrackingService.updateStatusByCompany(companyName, resultStatus, resultReason);
    }

    return { 
      status: resultStatus, 
      reason: resultReason, 
      companyExtracted: companyName,
      syncedWithDatabase: synced
    };
  }
}
