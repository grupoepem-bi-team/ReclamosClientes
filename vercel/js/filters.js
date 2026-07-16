const Filters = {
  init() {
    this.initEmpresa();
    this.initSucursal();
  },

  initEmpresa() {
    const empSel = document.getElementById('empresaFilter');
    if (!empSel) return;
    const empresas = Data.getAvailableEmpresas();
    empresas.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e; opt.textContent = e;
      empSel.appendChild(opt);
    });
  },

  initSucursal() {
    const sucSel = document.getElementById('sucursalFilter');
    if (!sucSel) return;
    sucSel.innerHTML = '<option value="all">Sucursal: Todas</option>';
    const empresa = State.getEmpresaFilter();
    const sucursales = Data.getAvailableSucursales(empresa);
    sucursales.sort().forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      sucSel.appendChild(opt);
    });
  },

  updateSucursales() {
    this.initSucursal();
  },

  setQuickPeriod(p) {
    State.setPeriod(p);
    document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
    if (p === 'month') {
      const btn = document.getElementById('btnMesActual');
      if (btn) btn.classList.add('active');
    } else {
      const btn = document.getElementById('btnHistorico');
      if (btn) btn.classList.add('active');
    }
    const fm = document.getElementById('filterMes');
    const fa = document.getElementById('filterAnio');
    if (fm) fm.value = '0';
    if (fa) fa.value = '0';
    App.render();
  },

  setPeriodFromFilters() {
    const mes = document.getElementById('filterMes');
    const anio = document.getElementById('filterAnio');
    const m = mes ? mes.value : '0';
    const a = anio ? anio.value : '0';
    document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
    if (m === '0' && a === '0') {
      State.setPeriod('all');
      const btn = document.getElementById('btnHistorico');
      if (btn) btn.classList.add('active');
    } else if (m === '0') {
      State.setPeriod('anio_' + a);
    } else if (a === '0') {
      State.setPeriod('mes_' + m);
    } else {
      State.setPeriod('exact_' + a + '_' + m);
    }
    App.render();
  }
};

window.Filters = Filters;