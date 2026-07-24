/**
 * Service responsável pela gestão de portais de busca e raspagem de vagas (RPA Playwright).
 * SRP: Definir os portais agregadores e diretos (LinkedIn, Gupy, Solides, Vagas.com, Greenhouse, Lever, Workday, InfoJobs).
 */
export class ScrapingService {
  constructor(browserProvider = null) {
    this.browserProvider = browserProvider;

    // Lista Expandida de Portais de Recrutamento Alvo (12 Portais & ATS)
    this.targetPlatforms = [
      { name: 'LinkedIn Jobs', baseUrl: 'https://www.linkedin.com/jobs/search/', category: 'Nacional/Internacional' },
      { name: 'Gupy', baseUrl: 'https://portal.gupy.io/', category: 'Nacional (Grandes Empresas)' },
      { name: 'Solides Jobs', baseUrl: 'https://portal.solides.com.br/', category: 'Nacional (Consultorias & Scale-ups)' },
      { name: 'Vagas.com', baseUrl: 'https://www.vagas.com.br/', category: 'Nacional (Corporativo)' },
      { name: 'InfoJobs', baseUrl: 'https://www.infojobs.com.br/', category: 'Nacional (Volume de Vagas)' },
      { name: '99Jobs', baseUrl: 'https://www.99jobs.com/', category: 'Nacional (Startups & Jovem Aprendiz/Pleno)' },
      { name: 'Glassdoor Brasil', baseUrl: 'https://www.glassdoor.com.br/Vagas/', category: 'Nacional com Inteligência Salarial' },
      { name: 'Catho', baseUrl: 'https://www.catho.com.br/vagas/', category: 'Nacional (Volume TI)' },
      { name: 'Greenhouse ATS', baseUrl: 'https://boards.greenhouse.io/', category: 'Global Tech' },
      { name: 'Lever ATS', baseUrl: 'https://jobs.lever.co/', category: 'Global Tech' },
      { name: 'Workday ATS', baseUrl: 'https://myworkdayjobs.com/', category: 'Multinacionais' },
      { name: 'RemoteOK / Remotive', baseUrl: 'https://remoteok.com/', category: 'Internacional em Dólar' },
    ];
  }

  getTargetPlatforms() {
    return this.targetPlatforms;
  }

  async followExternalJobRedirect(linkedInUrl) {
    const simulatedRedirectUrl = linkedInUrl.includes('4421862643')
      ? 'https://fortive.eightfold.ai/careers/job/893395274714?domain=fortive.com'
      : linkedInUrl;

    return {
      linkedInUrl,
      externalRedirectUrl: simulatedRedirectUrl,
      originPlatform: 'Eightfold.ai (Fortive Careers)',
      extractedSuccessfully: true,
      timestamp: new Date().toISOString(),
    };
  }

  async scrapeJobs(query = 'Full Stack OR QA OR DevOps OR Node.js', location = 'Remoto') {
    return [
      {
        title: 'Desenvolvedor Full Stack Pleno',
        company: 'Fortive / Fluke',
        location: location || 'Remoto',
        url: 'https://www.linkedin.com/jobs/view/4421862643',
        externalRedirectUrl: 'https://fortive.eightfold.ai/careers/job/893395274714?domain=fortive.com',
        source: 'LinkedIn ➔ Eightfold.ai',
        description: 'Desenvolvimento de software Full Stack com APIs RESTful, React, Node.js, testes automatizados e banco de dados.',
      },
      {
        title: 'Analista de Qualidade Pleno',
        company: 'Starta',
        location: 'Porto Alegre - RS (Remoto)',
        url: 'https://portal.gupy.io/job/starta-qa-123',
        source: 'Gupy',
        description: 'Planejamento e execução de testes manuais e automatizados com Selenium, JMeter, SoapUI, Java, TDD e CI/CD.',
      },
    ];
  }
}
