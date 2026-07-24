import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Service responsável por exportar os relatórios visuais Markdown em data/reports/:
 *  - vagas_aprovadas.md: Painel ultra-limpo de vagas qualificadas para aplicação direta (substitui "lista vip")
 *  - vagas_quarentena.md: Vagas retidas para revisão de falsos positivos
 *  - vagas_descartadas.md: Histórico transparente de vagas ignoradas com justificativa da IA
 *
 * Autoria: Heron Silva (@meherons) - Job Inquisitor 🕵️‍♂️
 */
export class ReportExportService {
  constructor(outputDir = path.resolve(process.cwd(), 'data/reports')) {
    this.outputDir = outputDir;
  }

  /**
   * Remove nomes de arquivos legados antigos para não poluir a pasta de relatórios.
   */
  async _cleanLegacyReportFiles() {
    const legacyFiles = ['lista_vip_vagas.md', 'LISTA_VIP_VAGAS.md', 'lista_quarentena_vagas.md', 'lista_ignoradas_vagas.md'];
    for (const file of legacyFiles) {
      try {
        await fs.unlink(path.join(this.outputDir, file));
      } catch {
        // Ignora se não existir
      }
    }
  }

  /**
   * Exporta a lista de Vagas Aprovadas para data/reports/vagas_aprovadas.md
   */
  async exportVipListToMarkdown(evaluatedJobs = []) {
    await fs.mkdir(this.outputDir, { recursive: true });
    await this._cleanLegacyReportFiles();

    const filePath = path.join(this.outputDir, 'vagas_aprovadas.md');

    let markdownContent = `# 🟢 Vagas Aprovadas para Candidatura

> **Job Inquisitor** | **Última Atualização:** ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
> **Total de Oportunidades Prontas:** ${evaluatedJobs.length}

---

## 🚀 Tabela de Candidatura Rápida (Clique e Aplique)

| # | Vaga | Empresa | Localização | Status | Link Direto para Aplicação |
|:---|:---|:---|:---|:---|:---|
`;

    if (evaluatedJobs.length === 0) {
      markdownContent += `| - | *Nenhuma vaga aprovada no momento* | - | - | - | - |\n\n`;
    } else {
      evaluatedJobs.forEach((job, index) => {
        const targetLink = job.externalRedirectUrl || job.url;
        const statusBadge = job.status === 'Aguardando Retorno' ? '⏳ Aplicado' : job.status === 'Entrevista' ? '🎉 Entrevista' : '🟢 Nova Vaga';
        const cleanTitle = (job.title || 'Vaga').replace(/\|/g, '-');
        const cleanCompany = (job.company || 'Empresa').replace(/\|/g, '-');
        const cleanLocation = (job.location || 'Remoto').replace(/\|/g, '-');

        markdownContent += `| **${index + 1}** | **${cleanTitle}** | ${cleanCompany} | ${cleanLocation} | \`${statusBadge}\` | [👉 **Candidatar-se**](${targetLink}) |\n`;
      });
    }

    markdownContent += `\n---\n\n## 📝 Detalhamento e Análise da Inteligência Artificial\n\n`;

    evaluatedJobs.forEach((job, index) => {
      const targetLink = job.externalRedirectUrl || job.url;
      const statusBadge = job.status === 'Aguardando Retorno' ? '⏳ Candidatura Efetuada' : job.status === 'Entrevista' ? '🎯 Em Processo Seletivo' : '🟢 Pronta para Candidatar';
      
      markdownContent += `### ${index + 1}. [${job.title} @ ${job.company}](${targetLink})\n`;
      markdownContent += `📍 **Local:** ${job.location} | **Status:** \`${statusBadge}\` | 🔗 [Abrir Formulário Direto](${targetLink})\n\n`;
      
      if (job.formattedReport) {
        markdownContent += `\`\`\`text\n${job.formattedReport}\n\`\`\`\n\n`;
      } else if (job.reason) {
        markdownContent += `> 💡 **Parecer da IA:** ${job.reason}\n\n`;
      }
      markdownContent += `---\n\n`;
    });

    await fs.writeFile(filePath, markdownContent, 'utf-8');
    return filePath;
  }

  /**
   * Exporta a lista de Quarentena para data/reports/vagas_quarentena.md
   */
  async exportQuarantineListToMarkdown(quarantineJobs = []) {
    await fs.mkdir(this.outputDir, { recursive: true });
    const filePath = path.join(this.outputDir, 'vagas_quarentena.md');

    let markdownContent = `# ☢️ Painel de Vagas em Quarentena

> **Instruções:** Vagas retidas temporariamente pela IA devido a suspeitas de vagas "Ghost" ou descrições incompletas.
> **Total Retido:** ${quarantineJobs.length}

---

## 📊 Tabela de Revisão Rápida

| # | Vaga | Empresa | ID para Resgate | Link |
|:---|:---|:---|:---|:---|
`;

    if (quarantineJobs.length === 0) {
      markdownContent += `| - | *Quarentena vazia! Nenhuma vaga suspeita retida.* | - | - | - |\n\n`;
    } else {
      quarantineJobs.forEach((job, index) => {
        const targetLink = job.externalRedirectUrl || job.url;
        markdownContent += `| **${index + 1}** | **${job.title}** | ${job.company} | \`${job.id}\` | [🔗 Ver Vaga](${targetLink}) |\n`;
      });
    }

    markdownContent += `\n---\n\n## 🔍 Motivos de Retenção pela IA\n\n`;

    quarantineJobs.forEach((job, index) => {
      const targetLink = job.externalRedirectUrl || job.url;
      markdownContent += `### ${index + 1}. ${job.title} @ ${job.company}\n`;
      markdownContent += `📍 **Local:** ${job.location} | ID: \`${job.id}\` | 🔗 [Link Original](${targetLink})\n\n`;
      markdownContent += `\`\`\`text\n${job.formattedReport || job.reason || 'Descrição suspeita ou vaga antiga'}\n\`\`\`\n\n---\n\n`;
    });

    await fs.writeFile(filePath, markdownContent, 'utf-8');
    return filePath;
  }

  /**
   * Exporta a lista de Ignoradas para data/reports/vagas_descartadas.md
   */
  async exportIgnoredListToMarkdown(ignoredJobs = []) {
    await fs.mkdir(this.outputDir, { recursive: true });
    const filePath = path.join(this.outputDir, 'vagas_descartadas.md');

    let markdownContent = `# 🛑 Histórico de Vagas Descartadas

> **Finalidade:** Registro de transparência. Exibe vagas reprovadas pela IA e o motivo do descarte.
> **Total Descartado:** ${ignoredJobs.length}

---

## 📊 Tabela Resumo de Descartes

| # | Vaga | Empresa | Fonte | Motivo Resumido |
|:---|:---|:---|:---|:---|
`;

    if (ignoredJobs.length === 0) {
      markdownContent += `| - | *Nenhuma vaga descartada registrada* | - | - | - |\n\n`;
    } else {
      ignoredJobs.forEach((job, index) => {
        const targetLink = job.externalRedirectUrl || job.url;
        const shortReason = (job.reason || job.formattedReport || 'Incompatível').split('\n')[0].substring(0, 60);
        markdownContent += `| **${index + 1}** | [${job.title}](${targetLink}) | ${job.company} | ${job.source || 'Portal'} | ${shortReason}... |\n`;
      });
    }

    markdownContent += `\n---\n\n## 📋 Justificativas Detalhadas do Descarte\n\n`;

    ignoredJobs.forEach((job, index) => {
      const targetLink = job.externalRedirectUrl || job.url;
      markdownContent += `### ${index + 1}. ${job.title} @ ${job.company}\n`;
      markdownContent += `📍 **Local:** ${job.location} | Fonte: ${job.source || 'Scraper'} | 🔗 [Link Original](${targetLink})\n\n`;
      markdownContent += `\`\`\`text\n${job.reason || job.formattedReport || 'Descartada por incompatibilidade de perfil ou salário'}\n\`\`\`\n\n---\n\n`;
    });

    await fs.writeFile(filePath, markdownContent, 'utf-8');
    return filePath;
  }
}
