const RenderCategorias = {
  CAT_MAP: {
    'Cancelacion de Contrato': { color: '#00875A', short: 'Cancelacion' },
    'Fin de Relacion / Baja Natural': { color: '#00875A', short: 'Fin Relacion' },
    'Cobranzas / Facturacion': { color: '#C7771F', short: 'Cobranzas' },
    'Retencion / Fidelizacion': { color: '#1B6EC2', short: 'Retencion' },
    'Disconformidad con Servicio': { color: '#C0392B', short: 'Disconformidad' },
    'Asesoramiento / Ventas': { color: '#1B6EC2', short: 'Asesoramiento' },
    'Agendamiento / Turnos': { color: '#23c6c8', short: 'Agendamiento' },
    'Operativos / Devoluciones': { color: '#C0392B', short: 'Operativos' },
    'Consultas / Otros': { color: '#8C92A5', short: 'Consultas' }
  },

  render() {
    try {
      const datosPorAnio = window.CATEGORIAS_MOTIVOS || {};
      const raw = datosPorAnio[State.getChartYear('categorias')] || [];
      if (!raw.length) {
        this._renderEmpty('donut-categorias');
        this._renderEmptyLegend('donut-legend');
        return;
      }

      const aggregated = this._aggregateCategories(raw);
      this._renderDonut(aggregated);
      this._renderLegend(aggregated);
    } catch (e) {
      console.error('RenderCategorias error:', e);
    }
  },

  _aggregateCategories(raw) {
    const map = {};
    raw.forEach(r => {
      const cat = this._categorize(r.nombre);
      const meta = this.CAT_MAP[cat] || { color: '#8C92A5', short: cat };
      if (!map[cat]) map[cat] = { name: cat, short: meta.short, color: meta.color, cantidad: 0, pct: 0 };
      map[cat].cantidad += parseInt(r.cantidad);
    });
    const total = Object.values(map).reduce((s, c) => s + c.cantidad, 0);
    const arr = Object.values(map).sort((a, b) => b.cantidad - a.cantidad);
    arr.forEach(c => c.pct = (c.cantidad / total * 100).toFixed(1));
    return { categories: arr, total };
  },

  _categorize(nombre) {
    const n = (nombre || '').toUpperCase().trim();
    if (/CANCELAC|CUMPLE CON LOS REQUISITOS|PIDE LA BAJA|DESEA CANCELAR|RENUNCIAR/.test(n)) return 'Cancelacion de Contrato';
    if (/CULMINA TRATAM|NO DISPONE DE TIEMPO|VIAJE|ENFERMEDAD|MUDANZA|FALLEC/.test(n)) return 'Fin de Relacion / Baja Natural';
    if (/DOBLE DEBITO|COBRANZ|CUOTA|FACTUR|DEVOLUCION VPOS|ACTUALIZACION DE CUOTAS|REINGRESO/.test(n)) return 'Cobranzas / Facturacion';
    if (/FIDELIZ|ACUERDO DE RECA|DERIVA A EJECUTIV|RETENCION|SUSPENCION/.test(n)) return 'Retencion / Fidelizacion';
    if (/DEMANDA|DISCONFORM|QUEJA|MALA ATENCION|CLINICA|DOCTOR|TRATAMIENTO MAL|NEGLIGENCIA/.test(n)) return 'Disconformidad con Servicio';
    if (/ASESOR|INFO FALSA|MAL ASESORAMIENTO|VENTAS/.test(n)) return 'Asesoramiento / Ventas';
    if (/AGENDAMIENTO|TURNO|NO CONSIGUE TURNO/.test(n)) return 'Agendamiento / Turnos';
    if (/VPOS|FRAUDE|OPERATIVO|DEVOLUCION/.test(n)) return 'Operativos / Devoluciones';
    return 'Consultas / Otros';
  },

  _renderDonut(data) {
    const container = document.getElementById('donut-categorias');
    if (!container) return;
    const size = 200, r = 80, cx = size / 2, cy = size / 2, strokeW = 28;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    let segments = '';
    data.categories.forEach(c => {
      const dash = (c.pct / 100) * circumference;
      segments += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.color}" stroke-width="${strokeW}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dasharray 400ms ease"/>`;
      offset += dash;
    });
    container.innerHTML = `<svg viewBox="0 0 ${size} ${size}" style="width:200px;height:200px;margin:auto;display:block">${segments}<text x="${cx}" y="${cy - 5}" class="donut-center donut-center-value">${data.total > 999 ? (data.total / 1000).toFixed(1) + 'K' : data.total}</text><text x="${cx}" y="${cy + 12}" class="donut-center donut-center-label">Total</text></svg>`;
  },

  _renderLegend(data) {
    const container = document.getElementById('donut-legend');
    if (!container) return;
    let html = '';
    data.categories.forEach(c => {
      html += `<div class="donut-legend-item"><div class="donut-legend-color" style="background:${c.color}"></div><div class="donut-legend-label">${c.short}</div><div class="donut-legend-value">${Data.fmt(c.cantidad)}</div><div class="donut-legend-pct">${c.pct}%</div></div>`;
    });
    container.innerHTML = html;
  },

  _renderEmpty(id) {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '<div class="empty-state"><div class="empty-icon">\uD83D\uDCCA</div><div class="empty-title">Sin datos</div><div class="empty-hint">No hay datos de categorias para este periodo</div></div>';
  },

  _renderEmptyLegend(id) {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '';
  }
};

window.RenderCategorias = RenderCategorias;