const RenderKPIs = {
  render(agg) {
    try {
      if (!agg || agg.total === 0) {
        this._clearAll();
        return;
      }
      const tasaRes = agg.total ? (agg.resueltos / agg.total * 100).toFixed(1) : 0;
      const pctFideli = agg.resueltos ? (agg.fidelizados / agg.resueltos * 100).toFixed(1) : 0;

      this._set('hero-recibidos', Data.fmt(agg.total));
      this._set('hero-resueltos', Data.fmt(agg.resueltos));
      this._set('hero-pendientes', Data.fmt(agg.pendientes));
      this._set('hero-fidelizados', pctFideli + '%');
      this._set('kpi-tasa', tasaRes + '%');
      this._set('kpi-dias', agg.diasProm || '—');
      this._set('kpi-clientes', Data.fmt(agg.clientes));

      this._renderCmp('cmp-recibidos', agg.cmp?.total, false);
      this._renderCmp('cmp-resueltos', agg.cmp?.resueltos, false);
      this._renderCmp('cmp-pendientes', agg.cmp?.pendientes, true);
      this._renderCmp('cmp-fidelizados', agg.cmp?.fidelizados, false);

      this._renderMetaTasa(tasaRes);
      this._renderMetaDias(agg.diasProm);
      this._renderMetaClientes(agg.cmp?.clientes);
    } catch (e) {
      console.error('RenderKPIs error:', e);
      this._clearAll();
    }
  },

  _renderCmp(id, cmp, lowerIsBetter) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!cmp) { el.textContent = ''; el.className = 'kpi-cmp'; return; }
    const arrow = cmp.dir === 'up' ? '\u2191' : cmp.dir === 'down' ? '\u2193' : '\u2192';
    const cls = cmp.favorable ? 'good' : 'bad';
    el.innerHTML = `${arrow} ${Math.abs(cmp.pct)}% <span style="opacity:0.6;font-weight:400">vs ${Data.fmt(cmp.prev)}</span>`;
    el.className = 'kpi-cmp ' + cls;
  },

  _renderMetaTasa(tasa) {
    const el = document.getElementById('meta-tasa');
    if (!el) return;
    const pct = parseFloat(tasa);
    const fillPct = Math.min(pct, 100);
    const color = pct >= 90 ? '#00875A' : pct >= 70 ? '#C7771F' : '#C0392B';
    el.innerHTML = `Meta: 90% <span class="meta-bar"><span class="meta-fill" style="width:${fillPct}%;background:${color}"></span></span>`;
  },

  _renderMetaDias(dias) {
    const el = document.getElementById('meta-dias');
    if (!el) return;
    if (!dias || dias === '—') { el.textContent = ''; return; }
    const d = parseFloat(dias);
    const cls = d <= 5 ? 'semaforo-green' : d <= 15 ? 'semaforo-yellow' : 'semaforo-red';
    const label = d <= 5 ? 'Bueno' : d <= 15 ? 'Aceptable' : 'Critico';
    el.innerHTML = `<span class="meta-semaforo ${cls}">${label}</span>`;
  },

  _renderMetaClientes(cmp) {
    const el = document.getElementById('meta-clientes');
    if (!el) return;
    if (!cmp) { el.textContent = ''; return; }
    const arrow = cmp.dir === 'up' ? '\u2191' : cmp.dir === 'down' ? '\u2193' : '\u2192';
    const cls = cmp.favorable ? 'good' : 'bad';
    el.innerHTML = `<span class="kpi-cmp ${cls}">${arrow} ${Math.abs(cmp.pct)}% vs ${Data.fmt(cmp.prev)}</span>`;
  },

  _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  _clearAll() {
    ['hero-recibidos','hero-resueltos','hero-pendientes','hero-fidelizados',
     'kpi-tasa','kpi-dias','kpi-clientes'
    ].forEach(id => this._set(id, '—'));
    ['cmp-recibidos','cmp-resueltos','cmp-pendientes','cmp-fidelizados',
     'meta-tasa','meta-dias','meta-clientes'
    ].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
  },

  staggerEntry() {
    const kpis = document.querySelectorAll('.big-kpi');
    kpis.forEach((kpi, i) => {
      kpi.classList.remove('kpi-enter');
      void kpi.offsetWidth;
      kpi.style.animationDelay = (i * 80) + 'ms';
      kpi.classList.add('kpi-enter');
    });
  }
};

window.RenderKPIs = RenderKPIs;