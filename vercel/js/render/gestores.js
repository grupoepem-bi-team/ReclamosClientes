const RenderGestores = {
  render() {
    try {
      const datosPorAnio = window.RANKING_GESTORES || {};
      const data = datosPorAnio[State.getChartYear('gestores')] || [];
      const tbody = document.getElementById('gestores-body');
      if (!tbody) return;
      tbody.textContent = '';

      if (!data.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.style.textAlign = 'center';
        td.style.color = '#8C92A5';
        td.style.padding = '20px';
        td.textContent = 'Sin datos';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      data.forEach((g, i) => {
        const tr = document.createElement('tr');
        const tdNum = document.createElement('td'); tdNum.className = 'num'; tdNum.textContent = i + 1;
        const tdNom = document.createElement('td'); tdNom.className = 'cliente'; tdNom.textContent = g.nombre;
        const tdCar = document.createElement('td'); tdCar.className = 'cant'; tdCar.textContent = g.cargados.toLocaleString();
        const tdSeg = document.createElement('td'); tdSeg.className = 'cant'; tdSeg.textContent = g.seguimientos ? g.seguimientos.toLocaleString() : '—';
        const tdAte = document.createElement('td'); tdAte.className = 'cant'; tdAte.textContent = g.atendidos ? g.atendidos.toLocaleString() : '—';
        const tdPer = document.createElement('td'); tdPer.className = 'rango'; tdPer.style.fontSize = '10px'; tdPer.style.color = '#8C92A5'; tdPer.textContent = g.periodo;
        tr.append(tdNum, tdNom, tdCar, tdSeg, tdAte, tdPer);
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('RenderGestores error:', e);
    }
  }
};

window.RenderGestores = RenderGestores;