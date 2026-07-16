const ChartDias = {
  render() {
    try {
      const data = Data.getEvolucionData(State.getChartYear('dias'));
      const sorted = [...data].sort((a, b) => a.anio - b.anio || a.mes - b.mes);
      const container = document.getElementById('chart-dias');
      if (!container) return;

      const diasValidos = sorted.filter(r => r.dias_prom && r.dias_prom !== 'null');
      if (!diasValidos.length) {
        container.innerHTML = '<div style="color:#A8AEC0;text-align:center;padding-top:60px">Sin datos</div>';
        return;
      }

      const diasData = diasValidos.map(r => parseFloat(r.dias_prom));
      const maxDias = Math.max(...diasData, 1);
      const w = 800, h = 220, pad = 44;

      let svg = '';
      const gridSteps = 5;
      const diasMaxRound = Math.ceil(maxDias / 5) * 5 || 5;
      for (let g = 0; g <= gridSteps; g++) {
        const yv = h - pad - (g / gridSteps) * (h - pad * 2);
        const val = (g / gridSteps * diasMaxRound).toFixed(0);
        svg += `<line x1="${pad}" y1="${yv}" x2="${w - pad}" y2="${yv}" stroke="#F4F5F8" stroke-width="1"/>`;
        svg += `<text x="${pad - 8}" y="${yv + 4}" font-size="11" fill="#A8AEC0" text-anchor="end">${val}</text>`;
      }

      let pathDias = '';
      let areaDias = '';
      diasValidos.forEach((r, i) => {
        const x = pad + (i / Math.max(diasValidos.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - (parseFloat(r.dias_prom) / diasMaxRound) * (h - pad * 2);
        pathDias += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
        if (i === 0) areaDias = 'M' + x + ',' + (h - pad) + ' L' + x + ',' + y + ' ';
        else areaDias += 'L' + x + ',' + y + ' ';
      });
      if (diasValidos.length > 0) {
        areaDias += 'L' + (pad + (diasValidos.length - 1) / Math.max(diasValidos.length - 1, 1) * (w - pad * 2)) + ',' + (h - pad) + ' Z';
      }

      diasValidos.forEach((r, i) => {
        const x = pad + (i / Math.max(diasValidos.length - 1, 1)) * (w - pad * 2);
        const y = h - pad - (parseFloat(r.dias_prom) / diasMaxRound) * (h - pad * 2);
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="#C0392B" stroke="#fff" stroke-width="2"/>`;
        svg += `<text x="${x}" y="${y - 8}" font-size="11" fill="#C0392B" font-weight="600" text-anchor="middle">${r.dias_prom}</text>`;
        svg += `<text x="${x}" y="${h - pad + 16}" font-size="11" fill="#8C92A5" text-anchor="middle">${MESES[r.mes]}</text>`;
      });
      svg += `<text x="${pad - 36}" y="${h/2}" font-size="11" fill="#8C92A5" text-anchor="middle" transform="rotate(-90 ${pad-36} ${h/2})">Dias</text>`;

      container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%">${svg}<path d="${areaDias}" fill="#C0392B" opacity="0.08"/><path d="${pathDias}" fill="none" stroke="#C0392B" stroke-width="2"/></svg>`;
    } catch (e) {
      console.error('ChartDias error:', e);
      const container = document.getElementById('chart-dias');
      if (container) container.innerHTML = '<div style="color:#C0392B;text-align:center;padding-top:60px">Error</div>';
    }
  }
};

window.ChartDias = ChartDias;