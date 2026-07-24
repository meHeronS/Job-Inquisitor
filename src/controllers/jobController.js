import { CompanyCareerPageService } from '../services/companyCareerPageService.js';
import { DeduplicationService } from '../services/deduplicationService.js';
import { EmailService } from '../services/emailService.js';
import { FormAutofillService } from '../services/formAutofillService.js';
import { LinkedInProfileService } from '../services/linkedInProfileService.js';
import { LLMService } from '../services/llmService.js';
import { MarketDataSearchService } from '../services/marketDataSearchService.js';
import { MatchService } from '../services/matchService.js';
import { PdfReaderService } from '../services/pdfReaderService.js';
import { PipelineMetricsService } from '../services/pipelineMetricsService.js';
import { ReportExportService } from '../services/reportExportService.js';
import { SalaryBenchmarkService } from '../services/salaryBenchmarkService.js';
import { ScrapingService } from '../services/scrapingService.js';
import { SecurityCryptoService } from '../services/securityCryptoService.js';
import { SessionManagerService } from '../services/sessionManagerService.js';
import { ApplicationTrackingService } from '../services/applicationTrackingService.js';
import { runDirectoryCleanup } from '../utils/cleanup.js';

/**
 * Controller de Orquestração das operações de Vagas, Criptografia AES-256, Exportação VIP, Deduplicação, Form Autocompletion e IA Local.
 * SRP: Conecta as camadas de serviços com a interface de entrada (CLI ou API futura).
 */
export class JobController {
  constructor(
    matchService = new MatchService(),
    scrapingService = new ScrapingService(),
    securityCryptoService = new SecurityCryptoService(),
    applicationTrackingService = new ApplicationTrackingService(),
    emailService = new EmailService([], securityCryptoService, applicationTrackingService),
    pdfReaderService = new PdfReaderService(),
    llmService = new LLMService(),
    salaryBenchmarkService = new SalaryBenchmarkService(),
    linkedInProfileService = new LinkedInProfileService(),
    marketDataSearchService = new MarketDataSearchService(),
    sessionManagerService = new SessionManagerService(),
    pipelineMetricsService = new PipelineMetricsService(),
    formAutofillService = new FormAutofillService(),
    companyCareerPageService = new CompanyCareerPageService(),
    deduplicationService = new DeduplicationService(),
    reportExportService = new ReportExportService()
  ) {
    // Executa a limpeza física e migração de diretórios obsoletos na inicialização
    try {
      runDirectoryCleanup();
    } catch {
      // Ignora pequenos avisos em ambientes somente leitura
    }

    this.matchService = matchService;
    this.scrapingService = scrapingService;
    this.securityCryptoService = securityCryptoService;
    this.applicationTrackingService = applicationTrackingService;
    this.emailService = emailService;
    this.pdfReaderService = pdfReaderService;
    this.llmService = llmService;
    this.salaryBenchmarkService = salaryBenchmarkService;
    this.linkedInProfileService = linkedInProfileService;
    this.marketDataSearchService = marketDataSearchService;
    this.sessionManagerService = sessionManagerService;
    this.pipelineMetricsService = pipelineMetricsService;
    this.formAutofillService = formAutofillService;
    this.companyCareerPageService = companyCareerPageService;
    this.deduplicationService = deduplicationService;
    this.reportExportService = reportExportService;
  }

  encryptData(plainText) {
    return this.securityCryptoService.encrypt(plainText);
  }

  decryptData(encryptedObj) {
    return this.securityCryptoService.decrypt(encryptedObj);
  }

  getOAuthSecurityInfo() {
    return this.securityCryptoService.getOAuthSecurityGuidelines();
  }

  deduplicateJobs(jobsList) {
    return this.deduplicationService.deduplicateJobs(jobsList);
  }

  async exportVipReport(evaluatedJobs) {
    return await this.reportExportService.exportVipListToMarkdown(evaluatedJobs);
  }

  getDirectCompanyCareerPages() {
    return this.companyCareerPageService.getTargetCompanies();
  }

  processFormAutofill(detectedFields, candidateProfile) {
    return this.formAutofillService.classifyFormFields(detectedFields, candidateProfile);
  }

  getPipelineMetrics(jobsList) {
    return this.pipelineMetricsService.calculateMetrics(jobsList);
  }

  getSsoSessionConfig() {
    return this.sessionManagerService.getSsoLoginInstructions();
  }

  async fetchLiveMarketSalary(company, role) {
    return await this.marketDataSearchService.fetchLiveMarketSalary(company, role);
  }

  async syncLinkedInProfile(profileUrl, optionalPdfPath) {
    return await this.linkedInProfileService.getCandidateProfileFromLinkedIn(profileUrl, optionalPdfPath);
  }

  calculateCltToPj(cltAmount) {
    return this.salaryBenchmarkService.convertCltToPj(cltAmount);
  }

  applySalaryGuardrails(candidateBaseFloor, rawCalculatedValue, contractType) {
    return this.salaryBenchmarkService.applyRealisticSalaryGuardrails(candidateBaseFloor, rawCalculatedValue, contractType);
  }

  async readResumePdf(filePath) {
    return await this.pdfReaderService.extractText(filePath);
  }

  async evaluateCandidatePotential(resumeText) {
    return await this.llmService.analyzeCandidatePotential(resumeText);
  }

  async searchAndEvaluateJobs(query, location, candidateProfile) {
    const scrapedJobs = await this.scrapingService.scrapeJobs(query, location);
    const uniqueJobs = this.deduplicateJobs(scrapedJobs);

    const evaluatedJobs = uniqueJobs.map((job) => {
      const match = this.matchService.evaluateMatch(candidateProfile, job);
      return {
        ...job,
        ...match,
      };
    });

    return evaluatedJobs;
  }

  processEmailFeedback(emailSubject, emailBody) {
    return this.emailService.parseEmailFeedback(emailSubject, emailBody);
  }

  getSystemStatus() {
    return {
      status: 'active',
      modules: [
        'ScrapingService',
        'MatchService',
        'EmailService',
        'PdfReaderService',
        'LLMService',
        'SalaryBenchmarkService',
        'LinkedInProfileService',
        'MarketDataSearchService',
        'SessionManagerService',
        'PipelineMetricsService',
        'FormAutofillService',
        'CompanyCareerPageService',
        'DeduplicationService',
        'ReportExportService',
        'SecurityCryptoService',
        'JobController',
      ],
      timestamp: new Date().toISOString(),
    };
  }
}
