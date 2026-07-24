/**
 * Service responsável por calcular e exibir o Painel de Candidaturas Ativas e Métricas do Funil.
 * SRP: Contabilidade de vagas por estado (Raspadas, Candidatadas/Ativas, Em Entrevista, Rejeitadas).
 */
export class PipelineMetricsService {
  /**
   * Calcula as métricas de candidaturas com base em uma lista de vagas salvas.
   * @param {Array} jobsList - Lista de documentos de vagas do MongoDB
   * @returns {Object} Painel de Métricas do Funil de Candidaturas
   */
  calculateMetrics(jobsList = []) {
    const totalScraped = jobsList.length;
    const activeApplications = jobsList.filter((j) => j.status === 'applied').length;
    const interviewsCount = jobsList.filter((j) => j.status === 'interview').length;
    const rejectedCount = jobsList.filter((j) => j.status === 'rejected').length;
    const evaluatedCount = jobsList.filter((j) => j.status === 'evaluated').length;

    return {
      totalScraped,
      evaluatedCount,
      activeApplications,
      interviewsCount,
      rejectedCount,
      conversionToInterviewRate: activeApplications > 0
        ? `${Math.round((interviewsCount / activeApplications) * 100)}%`
        : '0%',
      summaryText: `Painel de Candidaturas: ${activeApplications} Ativas | ${interviewsCount} Em Entrevista | ${rejectedCount} Rejeições | ${evaluatedCount} Prontas para Aplicação`,
    };
  }
}
