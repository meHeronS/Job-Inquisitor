import fs from 'node:fs/promises';
import path from 'node:path';
import { ApplicationTrackingService } from '../src/services/applicationTrackingService.js';
import { ReportExportService } from '../src/services/reportExportService.js';

async function syncVipJobs() {
  const atsService = new ApplicationTrackingService();
  await atsService.initDB();

  // Se existir lista_vip_vagas.md legada, migramos o conteúdo
  const legacyMdPath = path.resolve('data/reports/lista_vip_vagas.md');
  let content = '';
  try {
    content = await fs.readFile(legacyMdPath, 'utf-8');
  } catch {
    // Legado não encontrado ou já migrado
  }

  if (content) {
    const blocks = content.split(/\n### /).slice(1);
    let importedCount = 0;

    for (const block of blocks) {
      const titleCompanyMatch = block.match(/^\d+\.\s+\[(.*?)\]\((.*?)\)/);
      const locationMatch = block.match(/📍 \*\*Local:\*\* (.*?) \|/);

      if (titleCompanyMatch) {
        const fullTitleCompany = titleCompanyMatch[1];
        const url = titleCompanyMatch[2];
        const location = locationMatch ? locationMatch[1].trim() : 'Não especificado';

        const parts = fullTitleCompany.split(' @ ');
        const title = parts[0] ? parts[0].trim() : fullTitleCompany;
        const company = parts[1] ? parts[1].trim() : 'Confidencial';

        const jobData = {
          id: `JOB_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          title,
          company,
          location,
          url,
          externalRedirectUrl: url,
          source: 'LinkedIn Jobs',
          formattedReport: block
        };

        const result = await atsService.trackApplication(jobData, 'Nova Vaga');
        if (result) importedCount++;
      }
    }
    console.log(`✅ Sincronizadas ${importedCount} vagas ativas para data/db/applications.json!`);
  }

  // Gera os relatórios visuais limpos em data/reports/
  const reportExport = new ReportExportService();
  const vipJobs = await atsService.getAllApplications();
  const quarJobs = await atsService.getQuarantinedApplications();
  const ignJobs = await atsService.getIgnoredApplications();

  await reportExport.exportVipListToMarkdown(vipJobs);
  await reportExport.exportQuarantineListToMarkdown(quarJobs);
  await reportExport.exportIgnoredListToMarkdown(ignJobs);

  // Limpa relatórios legados com nomes velhos se existirem
  try {
    await fs.unlink(legacyMdPath);
  } catch {}

  console.log(`📊 Relatórios gerados com sucesso em data/reports/:`);
  console.log(` - vagas_aprovadas.md (${vipJobs.length} vagas)`);
  console.log(` - vagas_quarentena.md (${quarJobs.length} vagas)`);
  console.log(` - vagas_descartadas.md (${ignJobs.length} vagas)`);
}

syncVipJobs().catch(console.error);
