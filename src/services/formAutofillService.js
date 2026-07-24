/**
 * Service responsável por identificar campos de formulários de candidatura e realizar o pré-preenchimento automático (Autofill).
 * SRP: Mapeamento de DOM de formulários (Gupy, Solides, Greenhouse, Lever, InfoJobs) e automação assistida.
 */
export class FormAutofillService {
  constructor() {
    // Mapeamento padrão de seletores e atributos de formulários de RH
    this.fieldRules = [
      { key: 'name', patterns: ['nome', 'name', 'full_name', 'nome completo'] },
      { key: 'email', patterns: ['email', 'e-mail', 'mail'] },
      { key: 'phone', patterns: ['telefone', 'phone', 'celular', 'whatsapp', 'mobile'] },
      { key: 'linkedin', patterns: ['linkedin', 'linkedin_url', 'perfil do linkedin'] },
      { key: 'github', patterns: ['github', 'github_url', 'portfolio'] },
      { key: 'salaryExpectation', patterns: ['pretensao', 'pretensão', 'salario', 'salário', 'desired salary', 'salary expectation'] },
    ];
  }

  /**
   * Analisa os rótulos (labels) e campos encontrados na página do formulário pelo Playwright.
   * Classifica entre Campos Padrão (Auto-fill direto) e Perguntas Específicas (Interativas).
   * @param {Array} detectedFields - Campos detectados no formulário pelo Playwright [{ label, inputType, name }]
   * @param {Object} candidateProfile - Perfil do candidato com dados pessoais e pretensão salarial
   */
  classifyFormFields(detectedFields = [], candidateProfile = {}) {
    const autoFilledFields = [];
    const openQuestions = [];

    for (const field of detectedFields) {
      const labelText = (field.label || field.name || '').toLowerCase();
      let matchedStandardKey = null;

      for (const rule of this.fieldRules) {
        if (rule.patterns.some((pattern) => labelText.includes(pattern))) {
          matchedStandardKey = rule.key;
          break;
        }
      }

      if (matchedStandardKey) {
        autoFilledFields.push({
          fieldId: field.name || field.id,
          label: field.label,
          key: matchedStandardKey,
          autoValue: candidateProfile[matchedStandardKey] || candidateProfile.salaryExpectationToFill || 'Preenchido Automático',
          status: 'AUTO_FILLED',
        });
      } else {
        openQuestions.push({
          fieldId: field.name || field.id,
          questionText: field.label,
          type: field.inputType || 'text',
          status: 'NEEDS_SUGGESTION_OR_REVIEW',
        });
      }
    }

    return {
      autoFilledFields,
      openQuestions,
      summary: `Formulário Processado: ${autoFilledFields.length} campos pré-preenchidos automaticamente e ${openQuestions.length} perguntas discursivas para revisão.`,
    };
  }
}
