/**
 * Playwright helper — HomeProjectPlanner
 *
 * Usage (depuis la racine du projet) :
 *   PW_EMAIL=... PW_PASSWORD=... node .claude/skills/screenshot-homeprojectplanner/pw.cjs <commande> [route] [fichier.png]
 *
 * Commandes :
 *   screenshot <route> <fichier.png>     — screenshot de la route (après login)
 *   measure    <route> <fichier.png>     — screenshot + mesures DOM (overflow, rects)
 *   scroll     <route> <fichier.png>     — screenshot après scroll jusqu'en bas
 *
 * Prérequis : `pnpm add -D @playwright/test` + `pnpx playwright install chromium`,
 * et le dev server lancé (`pnpm dev`, port 5173 par défaut).
 *
 * ⚠️ Ce script se connecte au Supabase RÉEL (pas de stack local sur ce projet).
 *    Identifiants par variables d'env uniquement — ne JAMAIS les committer ici.
 */

const path = require('path');
const fs = require('fs');
// Remonte jusqu'à la racine du projet (3 niveaux au-dessus du skill)
const PROJECT_ROOT = path.join(__dirname, '../../..');
const { chromium } = require(path.join(PROJECT_ROOT, 'node_modules/@playwright/test/index.js'));

// Surchargeables par variables d'environnement.
const BASE_URL = process.env.PW_BASE_URL ?? 'http://localhost:5173';
const EMAIL = process.env.PW_EMAIL;
const PASSWORD = process.env.PW_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('PW_EMAIL et PW_PASSWORD sont requis (variables d\'environnement).');
  process.exit(1);
}

// Viewports disponibles. Défaut desktop (app desktop-first à sidebar).
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

async function launch(viewportName = 'desktop') {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewportName] ?? VIEWPORTS.desktop,
  });
  return { browser, ctx };
}

/** Login sur /signin et retourne la page prête. */
async function loginAndGo(ctx, route = '/') {
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/signin`);

  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  // Attendre la redirection post-login (hors /signin)
  await page.waitForURL((url) => !url.pathname.startsWith('/signin'), { timeout: 8000 });

  if (route !== '/' && !page.url().includes(route)) {
    await page.goto(`${BASE_URL}${route}`);
    await page.waitForLoadState('networkidle');
  }

  await page.waitForLoadState('networkidle');
  return page;
}

/** Mesures DOM utiles pour debugger layout/overflow. */
async function measureLayout(page) {
  return page.evaluate(() => {
    const sidebar = document.querySelector('[data-sidebar="sidebar"]') || document.querySelector('aside');
    const main = document.querySelector('main');
    const body = document.body;
    const html = document.documentElement;

    const rect = (el) => (el ? JSON.parse(JSON.stringify(el.getBoundingClientRect())) : null);
    const cs = (el, prop) => (el ? getComputedStyle(el)[prop] : null);

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      body: { scrollW: body.scrollWidth, clientW: body.clientWidth },
      html: { scrollW: html.scrollWidth },
      sidebar: { rect: rect(sidebar), w: cs(sidebar, 'width') },
      main: { rect: rect(main), overflow: cs(main, 'overflow'), overflowY: cs(main, 'overflowY') },
      links: Array.from(document.querySelectorAll('a[href^="/properties"]'))
        .slice(0, 10)
        .map((a) => a.getAttribute('href')),
    };
  });
}

function ensureDir(filepath) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const [, , cmd, route = '/', outFile = '.debug/screenshot.png'] = process.argv;

(async () => {
  const { browser, ctx } = await launch('desktop');
  try {
    const page = await loginAndGo(ctx, route);
    ensureDir(outFile);

    if (cmd === 'screenshot') {
      await page.screenshot({ path: outFile, fullPage: false });
      console.log(`Screenshot saved → ${outFile}`);
    } else if (cmd === 'measure') {
      await page.screenshot({ path: outFile, fullPage: false });
      const m = await measureLayout(page);
      console.log('Layout measures:');
      console.log(JSON.stringify(m, null, 2));
      console.log(`Screenshot saved → ${outFile}`);
    } else if (cmd === 'scroll') {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await page.screenshot({ path: outFile, fullPage: false });
      console.log(`Scroll screenshot saved → ${outFile}`);
    } else {
      console.error(`Commande inconnue: ${cmd}`);
      console.error('Usage: node pw.cjs <screenshot|measure|scroll> <route> <fichier.png>');
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
