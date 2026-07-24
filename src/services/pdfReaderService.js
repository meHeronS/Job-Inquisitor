import fs from 'node:fs/promises';
import pdfParse from 'pdf-parse';

/**
 * Service responsável por extrair texto limpo de arquivos PDF (Currículos e Documentos).
 * SRP: Leitura de arquivos binários PDF e conversão em texto puro para processamento da IA.
 */
export class PdfReaderService {
  /**
   * Extrai o texto contido em um arquivo PDF.
   * @param {string} filePath - Caminho absoluto ou relativo do arquivo PDF
   * @returns {Promise<string>} Texto extraído do PDF
   */
  async extractText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text ? data.text.trim() : '';
    } catch (error) {
      console.error(`[PdfReaderService]: Erro ao ler o arquivo PDF (${filePath}):`, error.message);
      throw new Error(`Falha na extração do PDF: ${error.message}`);
    }
  }
}
