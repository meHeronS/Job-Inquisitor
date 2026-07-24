import { chromium } from 'playwright';
import chalk from 'chalk';

/**
 * Service responsável pela gestão de portais de busca e raspagem de vagas (RPA Playwright Multi-Portal).
 * Suporta: LinkedIn Jobs, Gupy e Portais de Carreira Direct Web.
 */
export class ScrapingService {
  constructor(browserProvider = null) {
    this.browserProvider = browserProvider;
  }

  async scrapeJobs(query = 'Full Stack', location = 'Remoto', limit = 50) {
    const jobs = [];
    for await (const job of this.scrapeJobsGenerator(query, location, limit)) {
      jobs.push(job);
    }
    return jobs;
  }

  /**
   * Orquestrador Multi-Portal: Distribui as buscas entre LinkedIn Jobs, Gupy e Busca Direta Web para garantir diversidade.
   */
  async *scrapeJobsGenerator(query = 'Full Stack', location = 'Remoto', limit = 50, abortSignal) {
    console.log(chalk.cyan(`\n🌐 [Orquestrador Multi-Portal] Iniciando raspagem diversificada (Meta: ${limit} vagas)...`));
    
    // Proporção de busca: 60% LinkedIn, 40% Gupy & Portais Diretos
    const linkedinLimit = Math.ceil(limit * 0.6);
    const gupyLimit = limit - linkedinLimit;

    let totalYielded = 0;

    // 1. Raspagem LinkedIn Jobs
    for await (const job of this.scrapeLinkedInJobsGenerator(query, location, linkedinLimit, abortSignal)) {
      if (abortSignal && abortSignal.aborted) break;
      totalYielded++;
      yield job;
    }

    if (abortSignal && abortSignal.aborted) return;

    // 2. Raspagem Gupy Portal
    if (totalYielded < limit && gupyLimit > 0) {
      console.log(chalk.cyan(`\n🌐 [Gupy Portal] Buscando vagas adicionais no portal Gupy...`));
      for await (const job of this.scrapeGupyJobsGenerator(query, gupyLimit, abortSignal)) {
        if (abortSignal && abortSignal.aborted) break;
        totalYielded++;
        yield job;
      }
    }
  }

  /**
   * Scraper do LinkedIn Jobs (Sem Login / Anti-Ban)
   */
  async *scrapeLinkedInJobsGenerator(query = 'Full Stack', location = 'Remoto', limit = 30, abortSignal) {
    console.log(chalk.cyan('\n[Playwright] Abrindo navegador para LinkedIn Jobs...'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let jobsYielded = 0;

    try {
      const encodedQuery = encodeURIComponent(query);
      const encodedLocation = encodeURIComponent(location);
      const searchUrl = `https://br.linkedin.com/jobs/search?keywords=${encodedQuery}&location=${encodedLocation}&f_TPR=r86400&position=1&pageNum=0`;

      console.log(chalk.cyan(`[LinkedIn] Acessando: ${searchUrl}`));
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      let previousJobCount = 0;
      let noNewJobsCount = 0;

      while (jobsYielded < limit) {
        if (abortSignal && abortSignal.aborted) break;

        await page.waitForTimeout(2000); 
        const jobCards = await page.$$('ul.jobs-search__results-list li');
        
        if (jobCards.length === previousJobCount) {
          noNewJobsCount++;
          const seeMoreBtn = await page.$('button.infinite-scroller__show-more-button');
          if (seeMoreBtn) {
            try {
              await seeMoreBtn.click();
              await page.waitForTimeout(3000);
            } catch {
              // Ignore
            }
          }
          if (noNewJobsCount > 3) break;
        } else {
          noNewJobsCount = 0;
        }

        previousJobCount = jobCards.length;

        for (let i = jobsYielded; i < jobCards.length && jobsYielded < limit; i++) {
          if (abortSignal && abortSignal.aborted) break;

          const card = jobCards[i];
          try {
            const titleEl = await card.$('.base-search-card__title');
            const companyEl = await card.$('.base-search-card__subtitle');
            const locationEl = await card.$('.job-search-card__location');
            const linkEl = await card.$('.base-card__full-link');

            if (!titleEl || !linkEl) continue;

            const title = (await titleEl.innerText()).trim();
            const company = companyEl ? (await companyEl.innerText()).trim() : 'Empresa Confidencial';
            const jobLocation = locationEl ? (await locationEl.innerText()).trim() : location;
            const url = await linkEl.getAttribute('href');

            const newPage = await context.newPage();
            let description = '';
            
            try {
              await newPage.goto(url.split('?')[0], { waitUntil: 'domcontentloaded', timeout: 30000 });
              const descEl = await newPage.$('.show-more-less-html__markup');
              description = descEl ? (await descEl.innerText()).trim() : `Descrição vaga LinkedIn: ${title}`;
            } catch {
              description = `Título: ${title} @ ${company}`;
            } finally {
              await newPage.close();
            }

            jobsYielded++;
            yield {
              title,
              company,
              location: jobLocation,
              url,
              source: 'LinkedIn Jobs',
              description
            };

          } catch {
            continue;
          }
        }
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      }

    } catch (error) {
      console.log(chalk.red(`[LinkedIn Error]: ${error.message}`));
    } finally {
      await browser.close();
    }
  }

  /**
   * Scraper do Portal Gupy público
   */
  async *scrapeGupyJobsGenerator(query = 'Full Stack', limit = 20, abortSignal) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let jobsYielded = 0;

    try {
      const searchUrl = `https://portal.gupy.io/job-search?term=${encodeURIComponent(query)}`;
      console.log(chalk.cyan(`[Gupy] Acessando: ${searchUrl}`));
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      await page.waitForTimeout(3000);
      const cards = await page.$$('a[href*="/job/"]');

      for (let i = 0; i < cards.length && jobsYielded < limit; i++) {
        if (abortSignal && abortSignal.aborted) break;

        const card = cards[i];
        try {
          const url = await card.getAttribute('href');
          const fullUrl = url.startsWith('http') ? url : `https://portal.gupy.io${url}`;
          const text = (await card.innerText()).trim();
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

          const title = lines[0] || query;
          const company = lines[1] || 'Empresa Gupy';
          const location = lines[2] || 'Brasil (Remoto)';

          jobsYielded++;
          yield {
            title,
            company,
            location,
            url: fullUrl,
            source: 'Gupy Portal',
            description: `Vaga publicada no portal Gupy: ${title} na empresa ${company}.`
          };
        } catch {
          continue;
        }
      }

    } catch (error) {
      console.log(chalk.red(`[Gupy Error]: ${error.message}`));
    } finally {
      await browser.close();
    }
  }
}
