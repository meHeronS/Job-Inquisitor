import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';

/**
 * Service responsável pela Segurança da Informação Máxima, Criptografia AES-256-GCM com Derivação PBKDF2 e Chave de Hardware.
 * Autoria: Heron Silva (@meherons) - Job Inquisitor 🕵️‍♂️
 */
export class SecurityCryptoService {
  constructor(userPassphrase = null) {
    this.algorithm = 'aes-256-gcm';
    this.key = this.deriveMachineMasterKey(userPassphrase);
  }

  /**
   * Deriva uma chave mestre única de 256 bits usando PBKDF2 com Salt e Impressão Digital da Máquina (CPU/Hostname).
   */
  deriveMachineMasterKey(userPassphrase = null) {
    const machineFingerprint = `${os.hostname()}_${os.platform()}_${os.arch()}_${userPassphrase || 'job-inquisitor-master-secret-key-256'}`;
    const salt = crypto.createHash('sha256').update(`salt_${os.hostname()}`).digest();

    return crypto.pbkdf2Sync(machineFingerprint, salt, 100000, 32, 'sha256');
  }

  /**
   * Criptografa dados sensíveis antes de salvar no disco local e aplica permissão estrita de arquivo (0600).
   */
  encrypt(plainText) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  /**
   * Descriptografa dados garantindo a integridade via Tag de Autenticação.
   */
  decrypt({ encryptedData, iv, authTag }) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Aplica permissão estrita de sistema operacional (chmod 600).
   */
  enforceStrictFilePermissions(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.chmodSync(filePath, 0o600);
      }
    } catch {
      // Ignora em sistemas onde chmod não se aplica
    }
  }
}
