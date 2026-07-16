const RenderClientes = {
  render() {
    try {
      const datosPorAnio = window.RANKING_CLIENTES || {};
      const data = datosPorAnio[State.getChartYear('clientes')] || [];
      const tbody = document.getElementById('top-clientes-body');
      if (!tbody) return;
      tbody.textContent = '';

      if (!data.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.style.textAlign = 'center';
        td.style.color = '#8C92A5';
        td.style.padding = '20px';
        td.textContent = 'Sin datos';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
      }

      data.forEach((c, i) => {
        const tr = document.createElement('tr');
        const tdNum = document.createElement('td'); tdNum.className = 'num'; tdNum.textContent = i + 1;
        const tdNom = document.createElement('td'); tdNom.className = 'cliente'; tdNom.textContent = c.nombre;
        const tdCant = document.createElement('td'); tdCant.className = 'cant'; tdCant.textContent = c.cant;
        const tdRango = document.createElement('td'); tdRango.className = 'rango'; tdRango.style.fontSize = '10px'; tdRango.style.lineHeight = '1.4';
        const b1 = document.createElement('b'); b1.textContent = c.primer;
        const txt1 = document.createTextNode(' a ');
        const b2 = document.createElement('b'); b2.textContent = c.ultimo;
        const br1 = document.createElement('br');
        const span1 = document.createElement('span'); span1.style.color = '#1B6EC2'; span1.textContent = c.empresas;
        const br2 = document.createElement('br');
        const span2 = document.createElement('span'); span2.style.color = '#8C92A5'; span2.textContent = c.motivos;
        tdRango.append(b1, txt1, b2, br1, span1, br2, span2);
        tr.append(tdNum, tdNom, tdCant, tdRango);
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error('RenderClientes error:', e);
    }
  }
};

window.RenderClientes = RenderClientes;