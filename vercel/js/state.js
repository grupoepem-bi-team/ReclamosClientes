const MESES = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MESES_FULL = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const State = {
  currentPeriod: 'month',
  chartYears: {
    evolucion: 2026,
    dias: 2026,
    plazos: 2026,
    tabla: 2026,
    clientes: 2026,
    gestores: 2026,
    categorias: 2026
  },
  empresasValidas: ['MEE', 'MPP', 'ODO'],

  setPeriod(p) { this.currentPeriod = p; },
  setChartYear(key, y) { this.chartYears[key] = y; },
  getChartYear(key) { return this.chartYears[key]; },

  getEmpresaFilter() {
    const el = document.getElementById('empresaFilter');
    return el ? el.value : 'all';
  },
  getSucursalFilter() {
    const el = document.getElementById('sucursalFilter');
    return el ? el.value : 'all';
  }
};

window.MESES = MESES;
window.MESES_FULL = MESES_FULL;
window.State = State;