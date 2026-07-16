const RenderTabla = {
  render() {
    try {
      const data = Data.getEvolucionData(State.getChartYear('tabla'));
      const sorted = [...data].sort((a, b) => b.anio - a.anio || b.mes - a.mes);
      const tbody = document.getElementById('tabla-mensual');
      if (!tbody) return;

      if (!sorted.length) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8C92A5">Sin datos</td></tr>';
        return;
      }

      let html = '';
      sorted.forEach(r => {
        const pctRes = r.reclamos > 0 ? (parseInt(r.resueltos) / parseInt(r.reclamos) * 100).toFixed(1) : 0;
        const dias = r.dias_prom && r.dias_prom !== 'null' ? parseFloat(r.dias_prom) : null;
        const neto = parseInt(r.fidelizados) - parseInt(r.cancelaciones);
        const diasClass = dias === null ? '' : dias <= 2 ? 'good' : dias <= 10 ? 'warn' : 'bad';
        const netoClass = neto >= 0 ? 'good' : 'bad';
        html += `<tr><td class="left">${MESES[r.mes]} ${r.anio}</td><td>${Data.fmt(r.reclamos)}</td><td>${Data.fmt(r.resueltos)}</td><td>${pctRes}%</td><td>${dias !== null ? `<span class="badge ${diasClass}">${dias}</span>` : '—'}</td><td>${r.pct_mismo_dia || '—'}%</td><td>${r.pct_mas_30 || '—'}%</td><td style="color:#00875A">${r.fidelizados}</td><td style="color:#C0392B">${r.cancelaciones}</td><td><span class="badge ${netoClass}">${neto >= 0 ? '+' : ''}${neto}</span></td></tr>`;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.error('RenderTabla error:', e);
      const tbody = document.getElementById('tabla-mensual');
      if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#C0392B">Error cargando tabla</td></tr>';
    }
  }
};

window.RenderTabla = RenderTabla;