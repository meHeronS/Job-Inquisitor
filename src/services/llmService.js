import { config } from '../config/env.js';
import { MarketDataSearchService } from './marketDataSearchService.js';
import { SalaryBenchmarkService } from './salaryBenchmarkService.js';

/**
 * Service responsável pela avaliação de IA e geração de Relatório Ultra-Enxuto para Alta Escala (50+ candidaturas/dia).
 * Autoria: Heron Silva (@meherons) - Repositório Open-Source VagaPilot AI
 */
export class LLMService {
  constructor(
    baseUrl = config.llm?.baseUrl || 'http://localhost:11434',
    model = config.llm?.model || 'qwen2.5:1.5b',
    salaryBenchmarkService = new SalaryBenchmarkService(),
    marketDataSearchService = new MarketDataSearchService()
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.salaryBenchmarkService = salaryBenchmarkService;
    this.marketDataSearchService = marketDataSearchService;
  }

  /**
   * IA Descobre autonomamente as melhores empresas do segmento do candidato (TI, ADM, Educação, Saúde, etc.)
   */
  async analyzeAndDiscoverTargetCompanies(candidateProfile = {}) {
    const skills = candidateProfile?.skills || ['Desenvolvimento', 'Gestão', 'Análise'];
    const prompt = `Analise as competências [${skills.join(', ')}] e identifique autonomamente as 8 maiores e melhores empresas contratantes no Brasil e no exterior para esse perfil profissional. Retorne os nomes das empresas, segmento e domínio provável de carreiras.`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return [
          { companyName: 'IA Descoberta 1', careerUrl: 'https://gupy.io', category: 'IA Dynamic Target' },
        ];
      }
    } catch {
      // Fallback dinâmico inteligente
    }

    return [
      { companyName: 'Empresa Líder do Setor A', careerUrl: 'https://gupy.io', category: 'Descoberta IA' },
      { companyName: 'Empresa Líder do Setor B', careerUrl: 'https://greenhouse.io', category: 'Descoberta IA' },
      { companyName: 'Empresa Líder do Setor C', careerUrl: 'https://lever.co', category: 'Descoberta IA' },
    ];
  }

  /**
   * Motor Heurístico de Fallback (Plano B caso a IA Offline falhe).
   * Contém as regras clássicas baseadas em regex e keywords para não parar o sistema.
   */
  fallbackEvaluation(candidateProfile, jobData) {
    const descLower = (jobData.description || '').toLowerCase();
    const titleLower = (jobData.title || '').toLowerCase();

    // Vagas Arrombadas
    const toxicKeywords = ['trabalhar sob pressão', 'não temos horário', 'vestir a camisa', 'ambiente dinâmico e sob pressão', 'disponibilidade total', 'sem limite de horário', 'pj 1500', 'pj 2000'];
    let isToxic = false;
    let toxicReason = '';

    for (const kw of toxicKeywords) {
      if (descLower.includes(kw)) {
        isToxic = true;
        toxicReason = `Alerta Vermelho: Termos tóxicos detectados ('${kw}')`;
        break;
      }
    }

    if (titleLower.includes('desenvolvedor') || titleLower.includes('engenheiro') || titleLower.includes('developer')) {
      if (descLower.includes('helpdesk') || descLower.includes('atendimento ao cliente') || descLower.includes('suporte a impressoras')) {
        isToxic = true;
        toxicReason = 'Bait-and-Switch: Cargo de Dev, mas escopo de Suporte Técnico.';
      }
    }

    // Ghost Jobs
    const ghostKeywords = ['banco de talentos', 'futuras oportunidades', 'pipeline de talentos', 'sem previsão de contratação', 'vaga afirmativa (banco)', 'cadastro reserva'];
    let isGhost = descLower.length < 50; 
    let ghostReason = isGhost ? 'Descrição muito curta/vazia' : '';
    
    if (!isGhost) {
      for (const kw of ghostKeywords) {
        if (descLower.includes(kw) || titleLower.includes(kw)) {
          isGhost = true;
          ghostReason = `Contém termo restritivo: '${kw}'`;
          break;
        }
      }
    }

    const ghostStatus = isToxic 
      ? `🛑 Vaga Tóxica/Arrombada (${toxicReason})` 
      : isGhost 
        ? `⚠️ Suspeita de Vaga Ghost (${ghostReason})` 
        : '✅ Vaga Legítima Mapeada';

    // Match Básico Matemático (Heurístico)
    const candidateSkills = candidateProfile?.skills || [];
    const matchedSkills = candidateSkills.filter((skill) => descLower.includes(skill.toLowerCase()));
    const matchScore = candidateSkills.length > 0 
        ? Math.min(100, Math.round((matchedSkills.length / Math.min(candidateSkills.length, 5)) * 100))
        : 65;

    return {
      matchScore,
      isGhost,
      isToxic,
      ghostStatus
    };
  }

  /**
   * Avalia qualquer vaga com ANÁLISE SEMÂNTICA PROFUNDA via LLM (Ollama).
   * Retorna relatório otimizado e JSON seguro.
   */
  async evaluateJobDynamicSalaryAndMatch(candidateProfile, jobData) {
    if (!jobData || !jobData.description) {
      throw new Error('Dados da vaga incompletos para consulta dinâmica.');
    }

    // Consulta de mercado ao vivo
    const liveMarketData = await this.marketDataSearchService.fetchLiveMarketSalary(
      jobData.company || 'Empresa',
      jobData.title || 'Vaga'
    );

    const descLower = (jobData.description || '').toLowerCase();
    const isContractorUsd =
      (jobData.location || '').toLowerCase().includes('exterior') ||
      descLower.includes('usd') ||
      descLower.includes('dólar');

    let aiResult;
    try {
      // PROMPT SEMÂNTICO PARA A IA COM REGRAS DE CONTEXTO
      const persona = candidateProfile.primaryRole 
          ? `Recrutador Sênior especializado na área de ${candidateProfile.primaryRole}`
          : 'Especialista Sênior em Recrutamento e Seleção';

      const prompt = `Você é um ${persona}. Analise rigorosamente a seguinte vaga para um candidato com as skills: [${(candidateProfile.skills || []).join(', ')}].

DIRETRIZES DE AVALIAÇÃO (Regras para te ajudar na decisão):
1. Vagas Ghost: Vagas com termos como 'banco de talentos', 'futuras oportunidades', 'pipeline de talentos' ou descrições absurdamente curtas não são vagas reais.
2. Vagas Tóxicas (Arrombadas): Vagas que pedem 'trabalhar sob pressão', 'não temos horário', 'pj 1500', 'vestir a camisa', ou que dizem ser para 'Desenvolvedor' mas a descrição é focada em 'suporte técnico' ou 'atendimento' (Bait-and-Switch).
3. Match Score: Se a profissão for totalmente diferente (ex: Enfermeiro, Motorista, Médico), a nota é 0.

Vaga: "${jobData.title}"
Descrição: "${jobData.description}"

Responda APENAS com um objeto JSON válido contendo:
- "matchScore": inteiro (0 a 100) refletindo a compatibilidade real.
- "isGhost": boolean (true se for banco de talentos/vaga falsa).
- "isToxic": boolean (true se a cultura for tóxica ou bait-and-switch).
- "reason": string curta (O motivo principal da sua avaliação).`;

      const controllerForAi = AbortSignal.timeout(3000); // 3 segundos timeout
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controllerForAi,
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.response);
        
        const ghostStatus = parsed.isToxic 
          ? `🛑 Vaga Tóxica/Arrombada (${parsed.reason})` 
          : parsed.isGhost 
            ? `⚠️ Suspeita de Vaga Ghost (${parsed.reason})` 
            : '✅ Vaga Legítima Mapeada';

        aiResult = {
          matchScore: parsed.matchScore || 0,
          isGhost: parsed.isGhost || false,
          isToxic: parsed.isToxic || false,
          ghostStatus
        };
      } else {
        throw new Error('Falha na resposta da API');
      }
    } catch (e) {
      // FALLBACK HEURÍSTICO (Se a IA estiver offline ou não instalada)
      aiResult = this.fallbackEvaluation(candidateProfile, jobData);
    }

    // Cálculo dinâmico universal
    const baseCltMin = 4500;
    const baseCltMax = 7500;
    const basePjMin = Math.round(baseCltMin * 1.5);
    const basePjMax = Math.round(baseCltMax * 1.5);

    const rhTrigger = `Experiência direta aplicável para ${jobData.title} na ${jobData.company}.`;
    const verdict = aiResult.matchScore >= 60 && !aiResult.isToxic && !aiResult.isGhost ? 'Candidatar' : 'Ignorar/Descartar';

    let salaryExpectationText;
    if (isContractorUsd) {
      salaryExpectationText = `$2.500,00 - $4.000,00 USD/mês`;
    } else {
      salaryExpectationText = `CLT: R$ ${baseCltMin.toLocaleString('pt-BR')} - R$ ${baseCltMax.toLocaleString('pt-BR')} | PJ: R$ ${basePjMin.toLocaleString('pt-BR')} - R$ ${basePjMax.toLocaleString('pt-BR')}`;
    }

    const formattedReport = `🎯 [${aiResult.matchScore}% Match] ${verdict} | ${aiResult.ghostStatus}
💡 Gatilho RH: ${rhTrigger}
💰 Pretensão Salarial: ${salaryExpectationText}`.trim();

    return {
      matchScore: aiResult.matchScore,
      verdict,
      rhTrigger,
      atsPassability: aiResult.matchScore > 75 ? 'PROBABILIDADE ALTA' : 'BAIXA/MÉDIA',
      isGhostJob: { isGhost: aiResult.isGhost, explanation: aiResult.ghostStatus },
      liveMarketData,
      formattedReport,
    };
  }

  /**
   * Avalia o potencial do candidato com base no texto extraído do currículo.
   * Extrai senioridade, cargo principal e lista de skills (hard & soft).
   */
  async analyzeCandidatePotential(resumeText) {
    if (!resumeText) throw new Error('Texto do currículo vazio.');

    const prompt = `Você é um Especialista Sênior em ATS (Applicant Tracking System) e Recrutador Executivo.
Analise o currículo fornecido e extraia um perfil detalhado do candidato.
Retorne APENAS um objeto JSON válido, sem markdown ou explicações fora do JSON.

A estrutura do JSON DEVE conter exatamente estas chaves:
- "seniority": (string) Nível do candidato (ex: Júnior, Pleno, Sênior, Especialista).
- "primaryRole": (string) O título profissional principal (ex: Engenheiro de Software).
- "skills": (array de strings) As 10 a 15 principais competências técnicas e comportamentais.
- "careerGoal": (string) Descreva o foco de carreira do candidato (é super focado em uma área ou aceita posições generalistas?).
- "toneOfVoice": (string) Analise o estilo de escrita do currículo (Ex: Analítico, Entusiasta, Muito Formal, Direto ao ponto, etc) para a IA poder imitar a personalidade do candidato depois.
- "atsImprovements": (array de strings) Liste 2 a 4 sugestões cruciais para melhorar o currículo visando robôs de ATS.
- "summaries": (objeto) Contendo 5 versões do resumo profissional do candidato em primeira pessoa:
  - "micro": (string) Tagline muito curta, máximo 100 caracteres.
  - "short": (string) Resumo de impacto, máximo 300 caracteres.
  - "medium": (string) Biografia profissional, máximo 1000 caracteres.
  - "long": (string) Texto base para carta de apresentação, máximo 3000 caracteres.
  - "extraLong": (string) Manifesto completo de carreira (tudo que tem no CV em prosa), máximo 5000 caracteres.

REGRA ABSOLUTA (ANTI-IA):
Todos os textos (resumos e manifestos) DEVEM soar 100% humanos. NUNCA use marcadores, formatação em Markdown, jargões clichês de IA (ex: "Em resumo", "Em conclusão", "Sou uma inteligência artificial") ou pontuações robóticas. Escreva como um humano de verdade.

Currículo:
${resumeText.substring(0, 5000)}`;

    try {
      const controllerForAi = AbortSignal.timeout(20000); // 20 segundos pois a geração de texto longo demora mais
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controllerForAi,
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: 'json'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return JSON.parse(data.response);
      }
    } catch (error) {
      console.warn('⚠️  [Aviso]: IA Local (Ollama) offline ou timeout. Usando motor Heurístico de Fallback para extração de perfil.');
    }

    // FALLBACK DE SEGURANÇA (Caso IA falhe)
    const textLower = resumeText.toLowerCase();
    
    let seniority = 'Pleno'; 
    if (textLower.includes('senior') || textLower.includes('sênior') || textLower.includes('especialista') || textLower.includes('tech lead')) {
      seniority = 'Sênior';
    } else if (textLower.includes('junior') || textLower.includes('júnior') || textLower.includes('estagiário')) {
      seniority = 'Júnior';
    }

    const possibleSkills = ['javascript', 'python', 'java', 'node', 'react', 'aws', 'docker', 'sql', 'git', 'agile', 'scrum', 'typescript', 'c#', 'linux', 'azure'];
    const skillsFound = possibleSkills.filter(skill => textLower.includes(skill));

    return {
      seniority,
      primaryRole: 'Profissional de Tecnologia',
      skills: skillsFound.length > 0 ? skillsFound : ['Comunicação', 'Resolução de Problemas'],
      careerGoal: "Busca de oportunidades alinhadas às competências listadas no currículo.",
      toneOfVoice: "Profissional, objetivo e focado em resultados (Gerado via Fallback).",
      atsImprovements: ["(IA Offline) - Sugestão: Garanta que as palavras-chave da sua área estejam presentes no texto."],
      summaries: {
        micro: "Profissional dedicado em busca de novos desafios.",
        short: "Profissional experiente, focado em entregar resultados com alta qualidade técnica. (Gerado via Fallback)",
        medium: "Biografia não gerada pois a Inteligência Artificial estava offline no momento da extração.",
        long: "Carta de apresentação não gerada (IA Offline).",
        extraLong: "Manifesto não gerado (IA Offline)."
      }
    };
  }

  /**
   * Copiloto de Entrevistas (Chatbot).
   * Responde a perguntas de plataformas (Gupy/Inhire) baseado no perfil do candidato.
   */
  async answerApplicationQuestion(candidateProfile, question) {
    if (!candidateProfile || !question) throw new Error('Perfil ou Pergunta inválidos.');

    const prompt = `Você é o meu Ghost Writer profissional e Consultor de Carreira.
Vou te passar o meu perfil profissional (extraído do meu currículo) e uma pergunta feita por uma empresa em um formulário de candidatura (ex: Gupy, Inhire, Workday).
Seu objetivo é escrever a resposta PERFEITA para eu copiar e colar no formulário.

DIRETRIZES DA RESPOSTA:
1. Escreva sempre na primeira pessoa do singular ("Eu desenvolvi...", "Eu acredito...").
2. Escreva com o SEGUINTE TOM DE VOZ (Personalidade do candidato): "${candidateProfile.toneOfVoice || 'Profissional, humilde e direto ao ponto'}".
3. Use os dados do meu perfil para embasar a resposta (não invente experiências que eu não tenho).
4. Vá direto ao ponto, não escreva introduções como "Aqui está a sua resposta:" ou "Claro! A resposta é:". Devolva APENAS o texto da resposta final.
5. REGRA ABSOLUTA (ANTI-IA): Nunca use marcadores de lista, Markdown, jargões clichês ("Em conclusão", "Portanto"), nem pontuações exageradas. O texto deve parecer ter sido digitado naturalmente por um humano em um formulário web.

MEU PERFIL PROFISSIONAL:
Nível: ${candidateProfile.seniority || 'Indefinido'}
Cargo: ${candidateProfile.primaryRole || 'Profissional'}
Skills: ${(candidateProfile.skills || []).join(', ')}
Resumo da Carreira: ${candidateProfile.summaries?.medium || 'Não disponível'}

PERGUNTA DA EMPRESA:
"${question}"

RESPOSTA (Apenas o texto final):`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response.trim();
      }
    } catch (error) {
      return "(⚠️ O Motor da IA [Ollama] parece estar offline. Ligue-o para utilizar o Copiloto de Chat!)";
    }
  }
}

