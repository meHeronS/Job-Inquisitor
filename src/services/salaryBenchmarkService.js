/**
 * Service responsável por benchmarks salariais de TI, equivalência CLT x PJ
 * e travas de realismo (Guardrails Salariais) baseados na bagagem técnica real do candidato.
 * SRP: Garantir pretensões salariais críveis, defensáveis e sem inflação irrealista.
 */
export class SalaryBenchmarkService {
  /**
   * Converte um valor CLT mensal para o equivalente necessário no modelo PJ (Simples Nacional).
   * Regra de mercado: PJ ideal = CLT * 1.55x.
   */
  convertCltToPj(cltAmount) {
    const multiplier = 1.55;
    const equivalentPj = Math.round(cltAmount * multiplier);

    return {
      cltAmount,
      equivalentPj,
      formattedClt: `R$ ${cltAmount.toLocaleString('pt-BR')},00 (CLT)`,
      formattedPj: `R$ ${equivalentPj.toLocaleString('pt-BR')},00 (PJ / Simples Nacional)`,
      explanation: `Para equiparar um salário CLT de R$ ${cltAmount.toLocaleString('pt-BR')},00 aos benefícios e tributação do Simples Nacional, o valor PJ recomendado é R$ ${equivalentPj.toLocaleString('pt-BR')},00.`,
    };
  }

  /**
   * Aplica TRAVAS DE REALISMO SALARIAL (Guardrails) cruzando a vaga com a bagagem comprovada do currículo.
   * Evita pretensões salariais inflacionadas que causem descarte imediato do candidato pelo RH.
   * @param {number} candidateBaseFloor - Salário mínimo configurado pelo candidato (ex: R$ 4.000,00)
   * @param {number} rawCalculatedValue - Valor preliminar calculado pela IA/Mercado
   * @param {string} contractType - 'CLT' | 'PJ' | 'CONTRACTOR_USD'
   * @returns {Object} Valor ajustado com travas de segurança salarial
   */
  applyRealisticSalaryGuardrails(candidateBaseFloor = 4000, rawCalculatedValue = 7500, contractType = 'CLT') {
    const minFloor = Math.max(4000, candidateBaseFloor);

    let boundedValue = rawCalculatedValue;

    // Teto realista para evitar rejeição por super-inflação em seleções no Brasil
    const maxRealisticCeilingClt = 12500; // Teto defensável para posições Pleno/Sênior em desenvolvimento/QA/DevOps
    const maxRealisticCeilingPj = Math.round(maxRealisticCeilingClt * 1.55); // R$ 19.375,00

    if (contractType === 'PJ') {
      boundedValue = Math.max(Math.round(minFloor * 1.55), Math.min(boundedValue, maxRealisticCeilingPj));
      return {
        targetValue: boundedValue,
        formattedExpectation: `R$ ${boundedValue.toLocaleString('pt-BR')},00 (PJ)`,
        guardrailStatus: boundedValue < rawCalculatedValue ? 'Ajustado para o Teto Defensável' : 'Dentro do Limite Realista',
        justification: `Pretensão PJ calibrada para manter alta competitividade na triagem de RH sem inflação de valores.`,
      };
    }

    if (contractType === 'CONTRACTOR_USD') {
      const boundedUsd = Math.max(2200, Math.min(rawCalculatedValue, 4500));
      return {
        targetValue: boundedUsd,
        formattedExpectation: `$${boundedUsd.toLocaleString('en-US')},00 USD / mês`,
        guardrailStatus: 'Dentro do Limite Realista Internacional',
        justification: `Pretensão USD calibrada para o perfil de contrato no exterior.`,
      };
    }

    // CLT Padrão
    boundedValue = Math.max(minFloor, Math.min(boundedValue, maxRealisticCeilingClt));
    return {
      targetValue: boundedValue,
      formattedExpectation: `R$ ${boundedValue.toLocaleString('pt-BR')},00 (CLT)`,
      guardrailStatus: boundedValue < rawCalculatedValue ? 'Ajustado para o Teto Defensável CLT' : 'Dentro do Limite Realista',
      justification: `Pretensão CLT mantida no intervalo realista de R$ ${minFloor.toLocaleString('pt-BR')} a R$ ${maxRealisticCeilingClt.toLocaleString('pt-BR')} para garantir avanço nas fases de RH.`,
    };
  }
}
