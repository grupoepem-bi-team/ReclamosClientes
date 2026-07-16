const ChartEvolucion = {
  _tooltipData: [],

  render() {
    try {
      const data = Data.getEvolucionData(State.getChartYear('evolucion'));
      const sorted = [...data].sort((a, b) => a.anio - b.anio || a.mes - b.mes);
      const container = document.getElementById('chart-evolucion');
      const labelEl = document.getElementById('chart-period-label');
      if (!container) return;

      if (labelEl) labelEl.textContent = 'Año ' + State.getChartYear('evolucion');

      if (!sorted.length) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">\uD83D\uDCC8</div><div class="empty-title">Sin datos</div><div class="empty-hint">Cambia el ano o los filtros</div></div>';
        return;
      }

      const maxVal = Math.max(...sorted.map(r => parseInt(r.reclamos)), 1);
      const w = 800, h = 240, pad = 40;
      const xScale = (i, n) => pad + (i / Math.max(n - 1, 1)) * (w - pad * 2);
      const yScale = (v) => h - pad - (v / maxVal) * (h - pad * 2);

      this._tooltipData = sorted.map((r, i) => ({
        x: xScale(i, sorted.length),
        yRec: yScale(parseInt(r.reclamos)),
        yRes: yScale(parseInt(r.resueltos)),
        mes: MESES[r.mes],
        anio: r.anio,
        reclamos: r.reclamos,
        resueltos: r.resueltos
      }));

      let pathRecibidos = '', pathResueltos = '';
      let labels = '';
      let hoverAreas = '';
      sorted.forEach((r, i) => {
        const x = xScale(i, sorted.length);
        const yR = yScale(parseInt(r.reclamos));
        const yRes = yScale(parseInt(r.resueltos));
        pathRecibidos += (i === 0 ? 'M' : 'L') + x + ',' + yR + ' ';
        pathResueltos += (i === 0 ? 'M' : 'L') + x + ',' + yRes + ' ';
        if (i % Math.ceil(sorted.length / 8) === 0) labels += `<text x="${x}" y="${h-pad+16}" font-size="11" fill="#8C92A5" text-anchor="middle">${MESES[r.mes]}${String(r.anio).slice(2)}</text>`;
        hoverAreas += `<rect x="${x - (w-pad*2)/sorted.length/2}" y="0" width="${(w-pad*2)/sorted.length}" height="${h}" fill="transparent" class="hover-area" data-idx="${i}"/>`;
      });

      container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%"><path d="${pathRecibidos}" fill="none" stroke="#00875A" stroke-width="2"/><path d="${pathResueltos}" fill="none" stroke="#1B6EC2" stroke-width="2" stroke-dasharray="4"/>${labels}${hoverAreas}<text x="${pad}" y="${pad}" font-size="12" fill="#00875A">\u25CF Recibidos</text><text x="${pad+80}" y="${pad}" font-size="12" fill="#1B6EC2">--- Resueltos</text></svg>`;

      this._attachHover(container);
    } catch (e) {
      console.error('ChartEvolucion error:', e);
      const container = document.getElementById('chart-evolucion');
      if (container) container.innerHTML = '<div class="empty-state"><div class="empty-title">Error cargando grafico</div></div>';
    }
  },

  _attachHover(container) {
    let tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      tooltip.style.display = 'none';
      container.style.position = 'relative';
      container.appendChild(tooltip);
    }

    container.querySelectorAll('.hover-area').forEach(area => {
      area.addEventListener('mouseenter', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const d = this._tooltipData[idx];
        if (!d) return;
        tooltip.innerHTML = `<div class="tt-label">${d.mes} ${d.anio}</div><div class="tt-value" style="color:#00875A">Recibidos: ${Data.fmt(d.reclamos)}</div><div class="tt-value" style="color:#1B6EC2">Resueltos: ${Data.fmt(d.resueltos)}</div>`;
        tooltip.style.display = 'block';
        const rect = container.getBoundingClientRect();
        const svgRect = container.querySelector('svg').getBoundingClientRect();
        const svgW = svgRect.width;
        const xPct = d.x / 800;
        tooltip.style.left = Math.min(xPct * svgW + 10, rect.width - 150) + 'px';
        tooltip.style.top = '10px';
      });
      area.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  }
};

window.ChartEvolucion = ChartEvolucion;