// test-regresion.js - Regression test after removing Alertas section
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8766;
const BASE = `http://localhost:${PORT}`;
const SCREENSHOTS = path.join(__dirname, 'test-regresion-screenshots');

if (!fs.existsSync(SCREENSHOTS)) fs.mkdirSync(SCREENSHOTS, { recursive: true });

// Simple static file server
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'vercel', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff'
  };
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found');
    } else {
      res.writeHead(200, {
        'Content-Type': mime[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(data);
    }
  });
});

async function runTests() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`[TEST] Server running at ${BASE}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];

  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', message: err.message });
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  // --- TEST 1: Carga inicial (Panorama) ---
  console.log('[TEST] 1/6 Loading Panorama...');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS, '01-panorama.png'), fullPage: true });

  // --- TEST 2: Verificar que NO existe botón Alertas ---
  console.log('[TEST] 2/6 Checking Alertas button removed...');
  const alertasBtn = await page.$('button[data-section="alertas"]');
  if (alertasBtn) {
    errors.push({ type: 'assertion', message: 'Boton Alertas aun existe en el sidebar' });
  }

  // --- TEST 3: Verificar que NO existe section-alertas ---
  console.log('[TEST] 3/6 Checking section-alertas removed...');
  const alertasSection = await page.$('#section-alertas');
  if (alertasSection) {
    errors.push({ type: 'assertion', message: 'section-alertas aun existe en el DOM' });
  }

  // --- TEST 4: Navegar a Operación ---
  console.log('[TEST] 4/6 Navigating to Operacion...');
  await page.click('button[data-section="operacion"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '02-operacion.png'), fullPage: true });

  // --- TEST 5: Navegar a Clientes ---
  console.log('[TEST] 5/6 Navigating to Clientes...');
  await page.click('button[data-section="clientes"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '03-clientes.png'), fullPage: true });

  // --- TEST 6: Navegar a Negocio ---
  console.log('[TEST] 6/6 Navigating to Negocio...');
  await page.click('button[data-section="negocio"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '04-negocio.png'), fullPage: true });

  // --- TEST 7: Navegar a Equipo ---
  console.log('[TEST] 7/6 Navigating to Equipo...');
  await page.click('button[data-section="equipo"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS, '05-equipo.png'), fullPage: true });

  // --- RESULTS ---
  console.log('\n========== RESULTADOS ==========');
  console.log(`Console errors: ${consoleMessages.length}`);
  consoleMessages.forEach(c => console.log(`  - ${c.text}`));
  console.log(`Page errors: ${errors.length}`);
  errors.forEach(e => console.log(`  - [${e.type}] ${e.message}`));

  if (errors.length === 0 && consoleMessages.length === 0) {
    console.log('\n✅ TODOS LOS TESTS PASARON');
  } else {
    console.log('\n❌ HAY ERRORES EN LOS TESTS');
  }
  console.log(`Screenshots guardados en: ${SCREENSHOTS}`);
  console.log('================================\n');

  await browser.close();
  server.close();
  process.exit(errors.length > 0 || consoleMessages.length > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  server.close();
  process.exit(1);
});
