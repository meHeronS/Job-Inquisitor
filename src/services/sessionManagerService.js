import path from 'node:path';
import { SecurityCryptoService } from './securityCryptoService.js';

/**
 * Service responsável por gerenciar sessões autenticadas do navegador (Google SSO, LinkedIn SSO, Microsoft).
 * SRP: Armazenar e recarregar os cookies/tokens de sessão do Playwright na pasta isolada user_data/sessions/.
 */
export class SessionManagerService {
  constructor(
    storageStatePath = path.resolve(process.cwd(), 'user_data/sessions/session_state.json'),
    securityCryptoService = new SecurityCryptoService()
  ) {
    this.storageStatePath = storageStatePath;
    this.securityCryptoService = securityCryptoService;
  }

  getStorageStatePath() {
    return this.storageStatePath;
  }

  getGoogleOneTapSsoConfig() {
    return {
      strategy: 'Google One-Tap / OAuth SSO Popup',
      supportedProviders: ['Google', 'LinkedIn', 'Microsoft / Outlook'],
      autoClickAccount: true,
      encryptionStatus: 'AES-256-GCM Protegido em user_data/sessions/',
      userWorkflow: 'O usuário clica uma única vez em "Concordar/Permitir" na tela oficial do Google/Microsoft. O token de atualização é cifrado em user_data/sessions/.',
    };
  }
}
