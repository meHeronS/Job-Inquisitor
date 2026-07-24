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
import chalk from 'chalk';

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
    return await this.refreshAllReports();
  }

  async refreshAllReports() {
    const vipJobs = await this.applicationTrackingService.getAllApplications();
    const quarJobs = await this.applicationTrackingService.getQuarantinedApplications();
    const ignJobs = await this.applicationTrackingService.getIgnoredApplications();

    await this.reportExportService.exportVipListToMarkdown(vipJobs);
    await this.reportExportService.exportQuarantineListToMarkdown(quarJobs);
    await this.reportExportService.exportIgnoredListToMarkdown(ignJobs);
  }

  async searchAndEvaluateJobs(query, location, candidateProfile, limit = 50, abortSignal) {
    const evaluatedJobs = [];

    // Carrega histórico COMPLETO de todos os bancos em data/db/ para a Deduplicação (Instantânea)
    const pastJobs = await this.applicationTrackingService.getAllHistoricJobs();
    for (const pastJob of pastJobs) {
      this.deduplicationService.markAsProcessed(pastJob);
    }

    console.log(chalk.cyan(`\n[JobController] Histórico de ${pastJobs.length} vagas carregado. Iniciando busca e avaliação contínua...`));

    for await (const job of this.scrapingService.scrapeJobsGenerator(query, location, limit, abortSignal)) {
      if (abortSignal && abortSignal.aborted) break;

      // Deduplicação em tempo real
      const isDuplicate = this.deduplicationService.isDuplicate(job);
      if (isDuplicate) {
        process.stdout.write(chalk.gray(`\n⏭️  [Deduplicado] Pulando vaga já verificada anteriormente: ${job.title} @ ${job.company}`));
        continue;
      }
      this.deduplicationService.markAsProcessed(job);

      process.stdout.write(chalk.blue(`\n🤖 [IA] Avaliando: ${job.title} @ ${job.company}... `));

      // Inteligência Artificial
      const match = await this.llmService.evaluateJobDynamicSalaryAndMatch(candidateProfile, job);
      const fullJob = { ...job, ...match };
      
      if (fullJob.verdict === 'Candidatar') {
         process.stdout.write(chalk.green(`✅ Aprovada (${fullJob.matchScore}% Match) -> Adicionada à Lista VIP!`));
         await this.applicationTrackingService.trackApplication(fullJob, 'Nova Vaga');
      } else if (fullJob.verdict === 'Quarentena' || fullJob.isQuarantine) {
         process.stdout.write(chalk.yellow(`☢️ Retida em Quarentena (${fullJob.matchScore}% Match)`));
         await this.applicationTrackingService.trackApplication(fullJob, 'Quarentena');
      } else {
         process.stdout.write(chalk.red(`❌ Descartada (${fullJob.matchScore}% Match)`));
         await this.applicationTrackingService.trackApplication(fullJob, 'Ignorado');
      }

      evaluatedJobs.push(fullJob);

      // Atualiza os 3 arquivos Markdown em data/reports/ em tempo real
      await this.refreshAllReports();
    }

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
