const RenderOfrecimientos = {
  render() {
    try {
      const data = [
        { label: 'Descuento / Bonificacion', cant: 5626, pct: 89 },
        { label: 'Agregar Adherentes / Familia', cant: 2682, pct: 42 },
        { label: 'Nota de Modificacion', cant: 2465, pct: 39 },
        { label: 'Suspension Temporal', cant: 1051, pct: 17 },
        { label: 'Cambio de Plan', cant: 575, pct: 9 }
      ];
      const maxCant = data[0].cant;
      const container = document.getElementById('ofrecimientos-container');
      if (!container) return;
      container.textContent = '';
      data.forEach((d, i) => {
        const width = (d.cant / maxCant * 100).toFixed(0);
        const row = document.createElement('div'); row.className = 'hbar-row';
        const label = document.createElement('div'); label.className = 'hbar-label'; label.textContent = d.label;
        const track = document.createElement('div'); track.className = 'hbar-track';
        const fill = document.createElement('div'); fill.className = 'hbar-fill c' + (i+1); fill.style.width = width + '%'; fill.textContent = d.cant.toLocaleString();
        track.appendChild(fill);
        const pct = document.createElement('div'); pct.className = 'hbar-pct'; pct.textContent = d.pct + '%';
        row.append(label, track, pct);
        container.appendChild(row);
      });
    } catch (e) {
      console.error('RenderOfrecimientos error:', e);
    }
  }
};

window.RenderOfrecimientos = RenderOfrecimientos;