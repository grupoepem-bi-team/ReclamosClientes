const App = {
  _firstRender: true,
  _lastRefresh: 0,
  _refreshCooldown: 5 * 60 * 1000, // 5 minutos en ms
  _els: {},

  init() {
    try {
      this._cacheDOM();
      Filters.init();
      this.initEventListeners();
      this.initRefreshButton();
      Nav.init();
      this.renderStaticSections();
      Filters.setQuickPeriod('month');
    } catch (e) {
      console.error('App init error:', e);
    }
  },

  _cacheDOM() {
    this._els = {
      subtitle: document.getElementById('subtitle'),
      lastUpdate: document.getElementById('lastUpdate'),
      chartEvol: document.getElementById('chart-evolucion'),
      chartDias: document.getElementById('chart-dias'),
      chartPlazos: document.getElementById('chart-plazos'),
      tabla: document.getElementById('tabla-mensual'),
      tbodyClientes: document.getElementById('top-clientes-body'),
      tbodyGestores: document.getElementById('gestores-body'),
      btnMes: document.getElementById('btnMesActual'),
      btnHist: document.getElementById('btnHistorico'),
      filterMes: document.getElementById('filterMes'),
      filterAnio: document.getElementById('filterAnio'),
      empresaFilter: document.getElementById('empresaFilter'),
      sucursalFilter: document.getElementById('sucursalFilter')
    };
  },

  initEventListeners() {
    const e = this._els;
    if (e.btnMes) e.btnMes.addEventListener('click', () => Filters.setQuickPeriod('month'));
    if (e.btnHist) e.btnHist.addEventListener('click', () => Filters.setQuickPeriod('all'));
    if (e.filterMes) e.filterMes.addEventListener('change', () => Filters.setPeriodFromFilters());
    if (e.filterAnio) e.filterAnio.addEventListener('change', () => Filters.setPeriodFromFilters());
    if (e.empresaFilter) e.empresaFilter.addEventListener('change', () => { Filters.updateSucursales(); this.render(); });
    if (e.sucursalFilter) e.sucursalFilter.addEventListener('change', () => this.render());
  },

  initRefreshButton() {
    const container = document.querySelector('.quick-period');
    if (!container) return;
    const btn = document.createElement('button');
    btn.id = 'btnRefresh';
    btn.className = 'quick-btn';
    btn.title = 'Actualizar datos (max. 1 vez cada 5 min)';
    btn.innerHTML = '\u27F3 Actualizar';
    btn.addEventListener('click', () => this._handleRefresh(btn));
    container.appendChild(btn);
  },

  _handleRefresh(btn) {
    const now = Date.now();
    const elapsed = now - this._lastRefresh;
    if (this._lastRefresh && elapsed < this._refreshCooldown) {
      const remain = Math.ceil((this._refreshCooldown - elapsed) / 1000);
      btn.innerHTML = `\u23F1 ${Math.floor(remain/60)}:${String(remain%60).padStart(2,'0')}`;
      btn.disabled = true;
      btn.style.opacity = '0.6';
      setTimeout(() => {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.innerHTML = '\u27F3 Actualizar';
      }, this._refreshCooldown - elapsed);
      return;
    }
    this._lastRefresh = now;
    btn.disabled = true;
    btn.innerHTML = '\u27F3 Actualizando...';
    // Actualizar datos desde localStorage o recargar si hay API
    this.render();
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '\u27F3 Actualizar';
    }, 2000);
  },

  renderStaticSections() {
    RenderOfrecimientos.render();
    RenderMotivosFidelizan.render();
  },

  render() {
    try {
      const data = Data.getFiltered();

      RenderChips.render();

      if (!data.length) {
        this._renderEmpty();
        return;
      }

      const agg = Data.aggregate(data);
      RenderKPIs.render(agg);
      if (this._firstRender) {
        RenderKPIs.staggerEntry();
        this._firstRender = false;
      }
      RenderTabla.render();
      ChartEvolucion.render();
      ChartDias.render();
      ChartPlazos.render();
      RenderClientes.render();
      RenderGestores.render();
      RenderCategorias.render();
      this._updateSubtitle();
      this._updateLastUpdate();
    } catch (e) {
      console.error('App.render error:', e);
    }
  },

  _renderEmpty() {
    RenderKPIs._clearAll();
    const e = this._els;
    if (e.chartEvol) e.chartEvol.innerHTML = this._emptyState('No hay datos para este periodo', 'Prueba con otro filtro o periodo');
    if (e.chartDias) e.chartDias.innerHTML = this._emptyState('Sin datos', 'Cambia el ano o los filtros');
    if (e.chartPlazos) e.chartPlazos.innerHTML = this._emptyState('Sin datos', 'Cambia el ano o los filtros');
    if (e.tabla) e.tabla.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8C92A5">Sin datos para este periodo</td></tr>';
    if (e.tbodyClientes) e.tbodyClientes.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#8C92A5">Sin datos</td></tr>';
    if (e.tbodyGestores) e.tbodyGestores.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#8C92A5">Sin datos</td></tr>';
    RenderCategorias.render();
  },

  _emptyState(title, hint) {
    return '<div class="empty-state"><div class="empty-icon">\uD83D\uDCCA</div><div class="empty-title">' + title + '</div><div class="empty-hint">' + hint + '</div></div>';
  },

  _updateSubtitle() {
    const el = this._els.subtitle;
    if (!el) return;
    let label;
    const p = State.currentPeriod;
    if (p === 'month') label = 'Mes Actual (Junio 2026)';
    else if (p === 'all') label = 'Historico (todos los a\u00F1os)';
    else if (p.startsWith('mes_')) label = MESES_FULL[parseInt(p.split('_')[1])] + ' (todos los a\u00F1os)';
    else if (p.startsWith('anio_')) label = 'A\u00F1o ' + p.split('_')[1];
    else if (p.startsWith('exact_')) {
      const parts = p.split('_');
      label = MESES_FULL[parseInt(parts[2])] + ' ' + parts[1];
    } else label = 'Periodo desconocido';
    el.textContent = 'Departamento Comercial \u00B7 ' + label;
  },

  _updateLastUpdate() {
    const el = this._els.lastUpdate;
    if (!el) return;
    const data = Data.getRaw();
    if (!data.length) return;
    const maxAnio = Math.max(...data.map(r => r.anio));
    const maxMes = Math.max(...data.filter(r => r.anio === maxAnio).map(r => r.mes));
    el.textContent = 'Actualizado: ' + MESES_FULL[maxMes] + ' ' + maxAnio;
  }
};

window.App = App;

window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR:', e.message, e.filename, e.lineno);
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#C0392B;color:#fff;padding:8px 16px;font-size:11px;z-index:9999;font-family:monospace';
  const msg = (e.message || 'Error desconocido').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  const file = ((e.filename || '').split('/').pop() || '').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  errDiv.textContent = 'JS Error: ' + msg + ' (' + file + ':' + (e.lineno || '?') + ')';
  document.body.appendChild(errDiv);
  setTimeout(() => errDiv.remove(), 10000);
});

window.addEventListener('load', () => {
  try {
    App.init();
  } catch (e) {
    console.error('App.init FAILED:', e);
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#C0392B;color:#fff;padding:16px;font-size:14px;z-index:9999';
    const msg = (e.message || 'Error desconocido').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
    errDiv.textContent = 'Error iniciando tablero: ' + msg;
    document.body.appendChild(errDiv);
  }
});
