const App = {
  _firstRender: true,

  init() {
    try {
      Filters.init();
      this.initEventListeners();
      Nav.init();
      this.renderStaticSections();
      Filters.setQuickPeriod('month');
    } catch (e) {
      console.error('App init error:', e);
    }
  },

  initEventListeners() {
    const btnMes = document.getElementById('btnMesActual');
    const btnHist = document.getElementById('btnHistorico');
    const filterMes = document.getElementById('filterMes');
    const filterAnio = document.getElementById('filterAnio');
    const empresaFilter = document.getElementById('empresaFilter');
    const sucursalFilter = document.getElementById('sucursalFilter');

    if (btnMes) btnMes.addEventListener('click', () => Filters.setQuickPeriod('month'));
    if (btnHist) btnHist.addEventListener('click', () => Filters.setQuickPeriod('all'));
    if (filterMes) filterMes.addEventListener('change', () => Filters.setPeriodFromFilters());
    if (filterAnio) filterAnio.addEventListener('change', () => Filters.setPeriodFromFilters());
    if (empresaFilter) empresaFilter.addEventListener('change', () => { Filters.updateSucursales(); this.render(); });
    if (sucursalFilter) sucursalFilter.addEventListener('change', () => this.render());
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
    const chartEvol = document.getElementById('chart-evolucion');
    const chartDias = document.getElementById('chart-dias');
    const chartPlazos = document.getElementById('chart-plazos');
    const tabla = document.getElementById('tabla-mensual');
    if (chartEvol) chartEvol.innerHTML = this._emptyState('No hay datos para este periodo', 'Prueba con otro filtro o periodo');
    if (chartDias) chartDias.innerHTML = this._emptyState('Sin datos', 'Cambia el ano o los filtros');
    if (chartPlazos) chartPlazos.innerHTML = this._emptyState('Sin datos', 'Cambia el ano o los filtros');
    if (tabla) tabla.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8C92A5">Sin datos para este periodo</td></tr>';
    const tbodyClientes = document.getElementById('top-clientes-body');
    if (tbodyClientes) tbodyClientes.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#8C92A5">Sin datos</td></tr>';
    const tbodyGestores = document.getElementById('gestores-body');
    if (tbodyGestores) tbodyGestores.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#8C92A5">Sin datos</td></tr>';
    RenderCategorias.render();
  },

  _emptyState(title, hint) {
    return `<div class="empty-state"><div class="empty-icon">\uD83D\uDCCA</div><div class="empty-title">${title}</div><div class="empty-hint">${hint}</div></div>`;
  },

  _updateSubtitle() {
    const subtitle = document.getElementById('subtitle');
    if (!subtitle) return;
    let label;
    const p = State.currentPeriod;
    if (p === 'month') label = 'Mes Actual (Junio 2026)';
    else if (p === 'all') label = 'Historico (todos los años)';
    else if (p.startsWith('mes_')) label = MESES_FULL[parseInt(p.split('_')[1])] + ' (todos los años)';
    else if (p.startsWith('anio_')) label = 'Año ' + p.split('_')[1];
    else if (p.startsWith('exact_')) {
      const parts = p.split('_');
      label = MESES_FULL[parseInt(parts[2])] + ' ' + parts[1];
    } else label = 'Periodo desconocido';
    subtitle.textContent = `Departamento Comercial · ${label}`;
  },

  _updateLastUpdate() {
    const el = document.getElementById('lastUpdate');
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
  errDiv.textContent = 'JS Error: ' + e.message + ' (' + (e.filename||'').split('/').pop() + ':' + e.lineno + ')';
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
    errDiv.textContent = 'Error iniciando tablero: ' + e.message;
    document.body.appendChild(errDiv);
  }
});