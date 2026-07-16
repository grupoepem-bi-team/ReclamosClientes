const ChartPlazos = {
  render() {
    try {
      const data = Data.getEvolucionData(State.getChartYear('plazos'));
      const sorted = [...data].sort((a, b) => a.anio - b.anio || a.mes - b.mes);
      const container = document.getElementById('chart-plazos');
      if (!container) return;

      if (!sorted.length) {
        container.innerHTML = '<div style="color:#A8AEC0;text-align:center;padding-top:60px">Sin datos</div>';
        return;
      }

      const w = 800, h = 220, pad = 44;
      let svg = '';

      for (let g = 0; g <= 5; g++) {
        const yv = h - pad - (g / 5) * (h - pad * 2);
        const val = (g * 20);
        svg += `<line x1="${pad}" y1="${yv}" x2="${w - pad}" y2="${yv}" stroke="#F4F5F8" stroke-width="1"/>`;
        svg += `<text x="${pad - 8}" y="${yv + 4}" font-size="11" fill="#A8AEC0" text-anchor="end">${val}%</text>`;
      }

      let pathMismo = '', pathMas30 = '';
      sorted.forEach((r, i) => {
        const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2);
        const yMismo = h - pad - (parseFloat(r.pct_mismo_dia || 0) / 100) * (h - pad * 2);
        const yMas30 = h - pad - (parseFloat(r.pct_mas_30 || 0) / 100) * (h - pad * 2);
        pathMismo += (i === 0 ? 'M' : 'L') + x + ',' + yMismo + ' ';
        pathMas30 += (i === 0 ? 'M' : 'L') + x + ',' + yMas30 + ' ';
        svg += `<circle cx="${x}" cy="${yMismo}" r="4" fill="#00875A" stroke="#fff" stroke-width="2"/>`;
        svg += `<text x="${x}" y="${yMismo - 8}" font-size="11" fill="#00875A" font-weight="600" text-anchor="middle">${r.pct_mismo_dia || 0}%</text>`;
        svg += `<circle cx="${x}" cy="${yMas30}" r="4" fill="#C0392B" stroke="#fff" stroke-width="2"/>`;
        svg += `<text x="${x}" y="${h - pad + 16}" font-size="11" fill="#8C92A5" text-anchor="middle">${MESES[r.mes]}</text>`;
      });

      svg += `<text x="${pad}" y="${pad - 16}" font-size="12" fill="#00875A">● % Mismo dia</text>`;
      svg += `<text x="${pad + 100}" y="${pad - 16}" font-size="12" fill="#C0392B">--- % +30 dias</text>`;
      svg += `<text x="${pad - 36}" y="${h/2}" font-size="11" fill="#8C92A5" text-anchor="middle" transform="rotate(-90 ${pad-36} ${h/2})">%</text>`;

      container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%">${svg}<path d="${pathMismo}" fill="none" stroke="#00875A" stroke-width="2"/><path d="${pathMas30}" fill="none" stroke="#C0392B" stroke-width="2" stroke-dasharray="4"/></svg>`;
    } catch (e) {
      console.error('ChartPlazos error:', e);
      const container = document.getElementById('chart-plazos');
      if (container) container.innerHTML = '<div style="color:#C0392B;text-align:center;padding-top:60px">Error</div>';
    }
  }
};

window.ChartPlazos = ChartPlazos;