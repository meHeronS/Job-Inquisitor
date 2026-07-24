import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Service responsável por exportar a Lista VIP em Formato Ultra-Enxuto para aplicação rápida de alta escala (50+ candidaturas/dia).
 * SRP: Gerar o relatório visual compacto e direto para clique imediato no navegador.
 * Autoria: Heron Silva (@meherons) - Job Inquisitor 🕵️‍♂️
 */
export class ReportExportService {
  constructor(outputDir = path.resolve(process.cwd(), 'data/reports')) {
    this.outputDir = outputDir;
  }

  /**
   * Exporta a Lista VIP para o arquivo data/reports/LISTA_VIP_VAGAS.md em formato Ultra-Enxuto.
   * @param {Array} evaluatedJobs - Lista de vagas avaliadas
   * @returns {Promise<string>} Caminho do arquivo gerado
   */
  async exportVipListToMarkdown(evaluatedJobs = []) {
    await fs.mkdir(this.outputDir, { recursive: true });
    const filePath = path.join(this.outputDir, 'LISTA_VIP_VAGAS.md');

    let markdownContent = `# 🕵️‍♂️ Lista VIP de Candidaturas Rápidas (Job Inquisitor)

> **Autor:** Heron Silva (@meherons) | **Atualizado:** ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

---

`;

    if (evaluatedJobs.length === 0) {
      markdownContent += `*Nenhuma vaga investigada no momento.*\n`;
    } else {
      evaluatedJobs.forEach((job, index) => {
        const targetLink = job.externalRedirectUrl || job.url;
        markdownContent += `### ${index + 1}. [${job.title} @ ${job.company}](${targetLink})\n`;
        markdownContent += `📍 **Local:** ${job.location} | 🔗 [Abrir Formulário Direto](${targetLink})\n`;
        markdownContent += `\`\`\`text\n${job.formattedReport || 'Avaliação IA'}\n\`\`\`\n\n`;
      });
    }

    await fs.writeFile(filePath, markdownContent, 'utf-8');
    return filePath;
  }
}
