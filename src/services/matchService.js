/**
 * Service responsável pela inteligência de Match UNIVERSAL entre qualquer perfil profissional e vagas.
 * SRP: Funciona para qualquer área do conhecimento (TI, Administração, Gestão, Licenciatura, Saúde, Direito, etc.).
 */
export class MatchService {
  /**
   * Avalia a compatibilidade de qualquer vaga com base nas competências detectadas no perfil do candidato.
   * @param {Object} candidateProfile - Perfil extraído do currículo (TI, ADM, Educação, Saúde, etc.)
   * @param {Object} jobData - Dados da vaga raspada
   */
  evaluateMatch(candidateProfile, jobData) {
    if (!jobData || !jobData.description) {
      throw new Error('Dados da vaga inválidos para avaliação de match.');
    }

    const descriptionLower = jobData.description.toLowerCase();
    const titleLower = (jobData.title || '').toLowerCase();

    // Mapeamento de senioridade universal
    let detectedSeniority = 'Pleno';
    if (titleLower.includes('estágio') || titleLower.includes('estag') || titleLower.includes('trainee')) {
      detectedSeniority = 'Estágio / Trainee';
    } else if (titleLower.includes('júnior') || titleLower.includes('junior') || titleLower.includes('jr')) {
      detectedSeniority = 'Júnior';
    } else if (titleLower.includes('sênior') || titleLower.includes('senior') || titleLower.includes('sr') || titleLower.includes('gerente') || titleLower.includes('diretor') || titleLower.includes('coordenador')) {
      detectedSeniority = 'Sênior / Gestão';
    }

    // Habilidades extraídas dinamicamente do currículo do usuário
    const candidateSkills = candidateProfile?.skills || [];
    const matchedSkills = candidateSkills.filter((skill) =>
      descriptionLower.includes(skill.toLowerCase())
    );

    const matchScore =
      candidateSkills.length > 0
        ? Math.min(100, Math.round((matchedSkills.length / Math.min(candidateSkills.length, 5)) * 100))
        : 65;

    return {
      matchScore,
      detectedSeniority,
      strengths: matchedSkills,
      gaps: candidateSkills.filter((s) => !matchedSkills.includes(s)),
      actionReport: {
        seniorityAssessment: `Vaga classificada como ${detectedSeniority}. Compatibilidade técnica/profissional de ${matchScore}%.`,
        recommendation: matchScore >= 60 ? 'Candidatar' : 'Candidatar com Adaptação',
      },
    };
  }
}
