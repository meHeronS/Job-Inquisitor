import { LLMService } from './llmService.js';

/**
 * Service responsável pela descoberta DINÂMICA de empresas e portais de "Trabalhe Conosco" via Inteligência Artificial.
 * SRP: Nenhuma lista fixa de empresas. A IA analisa o perfil de QUALQUER PROFISSÃO e identifica automaticamente as melhores empresas do mercado para varredura.
 */
export class CompanyCareerPageService {
  constructor(llmService = new LLMService()) {
    this.llmService = llmService;
    this.customCompanies = [];
  }

  /**
   * IA Descobre automaticamente as melhores empresas do segmento para o perfil do candidato.
   * @param {Object} candidateProfile - Perfil do candidato (TI, ADM, Saúde, Licenciatura, Engenharia, etc.)
   * @returns {Promise<Array>} Lista dinâmica de empresas descobertas pela IA
   */
  async discoverTargetCompaniesDynamically(candidateProfile = {}) {
    // A IA identifica o segmento e sugere as principais contratantes do mercado
    const discovered = await this.llmService.analyzeAndDiscoverTargetCompanies(candidateProfile);
    return [...discovered, ...this.customCompanies];
  }

  /**
   * Adiciona uma empresa manualmente se o usuário desejar.
   */
  addCompanyCareerPage(companyName, careerUrl, category = 'Custom') {
    this.customCompanies.push({ companyName, careerUrl, category });
  }
}
