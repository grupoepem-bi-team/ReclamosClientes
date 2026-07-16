const RenderMotivosFidelizan = {
  render() {
    try {
      const motivos = window.MOTIVOS_FIDELIZAN || [
        { nombre: 'Cancelacion cumple requisitos', cant: 2058 },
        { nombre: 'Actualizacion de cuotas', cant: 838 },
        { nombre: 'Acuerdo de fidelizacion', cant: 767 },
        { nombre: 'Se deriva a ejecutivos', cant: 644 },
        { nombre: 'Otros', cant: 533 }
      ];
      const maxCant = motivos.length ? motivos[0].cant : 1;
      const container = document.getElementById('motivos-fidelizan-container');
      if (!container) return;
      container.textContent = '';
      motivos.forEach((m, i) => {
        const width = (m.cant / maxCant * 100).toFixed(0);
        const row = document.createElement('div'); row.className = 'hbar-row';
        const label = document.createElement('div'); label.className = 'hbar-label'; label.style.width = '220px'; label.textContent = m.nombre;
        const track = document.createElement('div'); track.className = 'hbar-track';
        const fill = document.createElement('div'); fill.className = 'hbar-fill c' + (i+1); fill.style.width = width + '%'; fill.textContent = m.cant.toLocaleString();
        track.appendChild(fill);
        row.append(label, track);
        container.appendChild(row);
      });
    } catch (e) {
      console.error('RenderMotivosFidelizan error:', e);
    }
  }
};

window.RenderMotivosFidelizan = RenderMotivosFidelizan;