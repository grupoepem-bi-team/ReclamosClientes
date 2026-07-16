const Data = {
  getRaw() {
    return window.DATOS_RECLAMOS || [];
  },

  getFiltered() {
    const rows = this.getRaw();
    const empresa = State.getEmpresaFilter();
    const sucursal = State.getSucursalFilter();

    let filtered = this._filterByPeriod(rows);

    if (empresa === 'all' && sucursal === 'all') {
      // Usar registros pre-agregados a nivel total (empresa='all')
      return filtered.filter(r => r.empresa === 'all');
    }
    if (empresa !== 'all' && sucursal === 'all') {
      // Usar registros pre-agregados a nivel empresa (sucursal='all')
      return filtered.filter(r => r.empresa === empresa && r.sucursal === 'all');
    }
    if (empresa === 'all' && sucursal !== 'all') {
      // Todas las empresas, una sucursal especifica
      return filtered.filter(r => r.sucursal === sucursal && r.empresa !== 'all');
    }
    // Empresa y sucursal especificas
    return filtered.filter(r => r.empresa === empresa && r.sucursal === sucursal);
  },

  getEvolucionData(anioFiltro) {
    const rows = this.getRaw();
    const empresa = State.getEmpresaFilter();
    const sucursal = State.getSucursalFilter();

    let filtered = rows.filter(r => r.anio === anioFiltro);

    if (empresa === 'all' && sucursal === 'all') {
      return filtered.filter(r => r.empresa === 'all');
    }
    if (empresa !== 'all' && sucursal === 'all') {
      return filtered.filter(r => r.empresa === empresa && r.sucursal === 'all');
    }
    if (empresa === 'all' && sucursal !== 'all') {
      return filtered.filter(r => r.sucursal === sucursal && r.empresa !== 'all');
    }
    return filtered.filter(r => r.empresa === empresa && r.sucursal === sucursal);
  },

  _filterByPeriod(rows) {
    const p = State.currentPeriod;
    return rows.filter(r => {
      if (p === 'month') return r.anio === 2026 && r.mes === 6;
      if (p === 'all') return true;
      if (p.startsWith('mes_')) {
        const m = parseInt(p.split('_')[1]);
        return r.mes === m;
      }
      if (p.startsWith('anio_')) {
        const anio = parseInt(p.split('_')[1]);
        return r.anio === anio;
      }
      if (p.startsWith('exact_')) {
        const parts = p.split('_');
        return r.anio === parseInt(parts[1]) && r.mes === parseInt(parts[2]);
      }
      return true;
    });
  },

  aggregateByMonth(rows) {
    const byMonth = {};
    rows.forEach(r => {
      const key = r.anio + '-' + r.mes;
      if (!byMonth[key]) {
        byMonth[key] = { empresa: r.empresa, sucursal: 'all', anio: r.anio, mes: r.mes, reclamos: 0, resueltos: 0, pendientes: 0, fidelizados: 0, cancelaciones: 0, clientes: 0, _diasSum: 0, _diasCount: 0, _mismoDiaSum: 0, _mismoDiaCount: 0, _mas30Sum: 0, _mas30Count: 0 };
      }
      const m = byMonth[key];
      m.reclamos += parseInt(r.reclamos);
      m.resueltos += parseInt(r.resueltos);
      m.pendientes += parseInt(r.pendientes);
      m.fidelizados += parseInt(r.fidelizados);
      m.cancelaciones += parseInt(r.cancelaciones);
      m.clientes += parseInt(r.clientes);
      if (r.dias_prom && r.dias_prom !== 'null') { m._diasSum += parseFloat(r.dias_prom) * parseInt(r.reclamos); m._diasCount += parseInt(r.reclamos); }
      if (r.pct_mismo_dia && r.pct_mismo_dia !== 'null') { m._mismoDiaSum += parseFloat(r.pct_mismo_dia) * parseInt(r.reclamos); m._mismoDiaCount += parseInt(r.reclamos); }
      if (r.pct_mas_30 && r.pct_mas_30 !== 'null') { m._mas30Sum += parseFloat(r.pct_mas_30) * parseInt(r.reclamos); m._mas30Count += parseInt(r.reclamos); }
    });
    return Object.values(byMonth).map(m => ({
      ...m,
      dias_prom: m._diasCount > 0 ? (m._diasSum / m._diasCount).toFixed(1) : null,
      pct_mismo_dia: m._mismoDiaCount > 0 ? (m._mismoDiaSum / m._mismoDiaCount).toFixed(1) : null,
      pct_mas_30: m._mas30Count > 0 ? (m._mas30Sum / m._mas30Count).toFixed(1) : null
    }));
  },

  aggregate(rows) {
    const total = rows.reduce((s, r) => s + parseInt(r.reclamos), 0);
    const resueltos = rows.reduce((s, r) => s + parseInt(r.resueltos), 0);
    const pendientes = rows.reduce((s, r) => s + parseInt(r.pendientes), 0);
    const fidelizados = rows.reduce((s, r) => s + parseInt(r.fidelizados), 0);
    const cancelaciones = rows.reduce((s, r) => s + parseInt(r.cancelaciones), 0);
    const clientes = rows.reduce((s, r) => s + parseInt(r.clientes), 0);

    let diasSum = 0, diasCount = 0;
    let mismoDiaSum = 0, mismoDiaCount = 0;
    let mas30Sum = 0, mas30Count = 0;
    rows.forEach(r => {
      const w = parseInt(r.reclamos);
      if (r.dias_prom && r.dias_prom !== 'null') { diasSum += parseFloat(r.dias_prom) * w; diasCount += w; }
      if (r.pct_mismo_dia && r.pct_mismo_dia !== 'null') { mismoDiaSum += parseFloat(r.pct_mismo_dia) * w; mismoDiaCount += w; }
      if (r.pct_mas_30 && r.pct_mas_30 !== 'null') { mas30Sum += parseFloat(r.pct_mas_30) * w; mas30Count += w; }
    });
    const diasProm = diasCount > 0 ? (diasSum / diasCount).toFixed(1) : null;
    const pctMismo = mismoDiaCount > 0 ? (mismoDiaSum / mismoDiaCount).toFixed(1) : null;
    const pctMas30 = mas30Count > 0 ? (mas30Sum / mas30Count).toFixed(1) : null;

    const prev = this._getPreviousAggregate();
    const cmp = this._buildComparison({ total, resueltos, pendientes, fidelizados, clientes, diasProm, pctMismo, pctMas30 }, prev);

    return { total, resueltos, pendientes, fidelizados, cancelaciones, clientes, diasProm, pctMismo, pctMas30, cmp };
  },

  _getPreviousFiltered() {
    const rows = this.getRaw();
    const empresa = State.getEmpresaFilter();
    const sucursal = State.getSucursalFilter();
    const prevP = this._getPreviousPeriod();
    if (!prevP) return [];

    let filtered = rows.filter(r => {
      if (prevP === 'all') return true;
      if (prevP.startsWith('mes_')) return r.mes === parseInt(prevP.split('_')[1]);
      if (prevP.startsWith('anio_')) return r.anio === parseInt(prevP.split('_')[1]);
      if (prevP.startsWith('exact_')) {
        const parts = prevP.split('_');
        return r.anio === parseInt(parts[1]) && r.mes === parseInt(parts[2]);
      }
      return false;
    });

    if (empresa === 'all' && sucursal === 'all') {
      return filtered.filter(r => r.empresa === 'all');
    }
    if (empresa !== 'all' && sucursal === 'all') {
      return filtered.filter(r => r.empresa === empresa && r.sucursal === 'all');
    }
    if (empresa === 'all' && sucursal !== 'all') {
      return filtered.filter(r => r.sucursal === sucursal && r.empresa !== 'all');
    }
    return filtered.filter(r => r.empresa === empresa && r.sucursal === sucursal);
  },

  _getPreviousPeriod() {
    const p = State.currentPeriod;
    if (p === 'month') return 'exact_2026_5';
    if (p === 'all') return null;
    if (p.startsWith('exact_')) {
      const parts = p.split('_');
      const anio = parseInt(parts[1]);
      const mes = parseInt(parts[2]);
      let prevMes = mes - 1, prevAnio = anio;
      if (prevMes === 0) { prevMes = 12; prevAnio = anio - 1; }
      if (prevAnio < 2024) return null;
      return 'exact_' + prevAnio + '_' + prevMes;
    }
    if (p.startsWith('anio_')) {
      const anio = parseInt(p.split('_')[1]);
      const prevAnio = anio - 1;
      if (prevAnio < 2024) return null;
      return 'anio_' + prevAnio;
    }
    if (p.startsWith('mes_')) return null;
    return null;
  },

  _getPreviousAggregate() {
    const prevRows = this._getPreviousFiltered();
    if (!prevRows.length) return null;
    return this._rawAggregate(prevRows);
  },

  _rawAggregate(rows) {
    const total = rows.reduce((s, r) => s + parseInt(r.reclamos), 0);
    const resueltos = rows.reduce((s, r) => s + parseInt(r.resueltos), 0);
    const pendientes = rows.reduce((s, r) => s + parseInt(r.pendientes), 0);
    const fidelizados = rows.reduce((s, r) => s + parseInt(r.fidelizados), 0);
    const clientes = rows.reduce((s, r) => s + parseInt(r.clientes), 0);
    let diasSum = 0, diasCount = 0;
    let mismoDiaSum = 0, mismoDiaCount = 0;
    let mas30Sum = 0, mas30Count = 0;
    rows.forEach(r => {
      const w = parseInt(r.reclamos);
      if (r.dias_prom && r.dias_prom !== 'null') { diasSum += parseFloat(r.dias_prom) * w; diasCount += w; }
      if (r.pct_mismo_dia && r.pct_mismo_dia !== 'null') { mismoDiaSum += parseFloat(r.pct_mismo_dia) * w; mismoDiaCount += w; }
      if (r.pct_mas_30 && r.pct_mas_30 !== 'null') { mas30Sum += parseFloat(r.pct_mas_30) * w; mas30Count += w; }
    });
    return {
      total, resueltos, pendientes, fidelizados, clientes,
      diasProm: diasCount > 0 ? parseFloat((diasSum / diasCount).toFixed(1)) : null,
      pctMismo: mismoDiaCount > 0 ? parseFloat((mismoDiaSum / mismoDiaCount).toFixed(1)) : null,
      pctMas30: mas30Count > 0 ? parseFloat((mas30Sum / mas30Count).toFixed(1)) : null
    };
  },

  _buildComparison(curr, prev) {
    if (!prev) return null;
    const calc = (c, p, lowerIsBetter) => {
      if (!c || !p || p === 0) return null;
      const pct = ((c - p) / p * 100).toFixed(1);
      const dir = c > p ? 'up' : c < p ? 'down' : 'flat';
      const favorable = lowerIsBetter ? dir === 'down' : dir === 'up';
      return { pct, dir, favorable, prev: p };
    };
    return {
      total: calc(curr.total, prev.total, false),
      resueltos: calc(curr.resueltos, prev.resueltos, false),
      pendientes: calc(curr.pendientes, prev.pendientes, true),
      fidelizados: calc(curr.fidelizados, prev.fidelizados, false),
      clientes: calc(curr.clientes, prev.clientes, false),
      diasProm: curr.diasProm && prev.diasProm ? calc(parseFloat(curr.diasProm), prev.diasProm, true) : null,
      pctMismo: curr.pctMismo && prev.pctMismo ? calc(parseFloat(curr.pctMismo), prev.pctMismo, false) : null,
      pctMas30: curr.pctMas30 && prev.pctMas30 ? calc(parseFloat(curr.pctMas30), prev.pctMas30, true) : null
    };
  },

  getAvailableEmpresas() {
    const rows = this.getRaw();
    if (!rows.length) return State.empresasValidas;
    return [...new Set(rows.map(r => r.empresa).filter(e => e !== 'all' && State.empresasValidas.includes(e)))];
  },

  getAvailableSucursales(empresa) {
    const rows = this.getRaw();
    if (!rows.length) {
      const sucFijas = {
        'all': ['Mcal Lopez','Brasilia','Nemby','San Lorenzo','CDE','Encarnacion','Asuncion'],
        'ODO': ['Mcal Lopez','Brasilia','Nemby','San Lorenzo','CDE','Encarnacion'],
        'MEE': ['San Lorenzo','CDE'],
        'MPP': ['Encarnacion','CDE','Asuncion']
      };
      return sucFijas[empresa] || sucFijas['all'];
    }
    if (empresa === 'all') {
      return [...new Set(rows.map(r => r.sucursal).filter(s => s !== 'all'))].sort();
    }
    return [...new Set(rows.filter(r => r.empresa === empresa).map(r => r.sucursal).filter(s => s !== 'all'))].sort();
  },

  fmt(n) { return n.toLocaleString('es-PY'); }
};

window.Data = Data;