const RenderChips = {
  render() {
    try {
      const container = document.getElementById('chipsRow');
      if (!container) return;
      const chips = [];
      const empresa = State.getEmpresaFilter();
      const sucursal = State.getSucursalFilter();
      const p = State.currentPeriod;
      const mesEl = document.getElementById('filterMes');
      const anioEl = document.getElementById('filterAnio');

      if (p === 'month') {
        chips.push({ label: 'Mes Actual (Junio 2026)', type: 'period' });
      } else if (p === 'all') {
        chips.push({ label: 'Historico', type: 'period' });
      } else if (p.startsWith('exact_')) {
        const parts = p.split('_');
        chips.push({ label: MESES_FULL[parseInt(parts[2])] + ' ' + parts[1], type: 'period' });
      } else if (p.startsWith('anio_')) {
        chips.push({ label: 'Año ' + p.split('_')[1], type: 'period' });
      } else if (p.startsWith('mes_')) {
        chips.push({ label: MESES_FULL[parseInt(p.split('_')[1])] + ' (todos los años)', type: 'period' });
      }

      if (empresa !== 'all') chips.push({ label: empresa, type: 'empresa' });
      if (sucursal !== 'all') chips.push({ label: sucursal, type: 'sucursal' });

      let html = '';
      if (chips.length === 0) {
        container.innerHTML = '';
        return;
      }
      chips.forEach(c => {
        html += `<span class="chip">${c.label}<span class="chip-x" data-type="${c.type}">\u00D7</span></span>`;
      });
      if (chips.length > 0) {
        html += '<button class="chip-clear" id="chipClearAll">Limpiar todo</button>';
      }
      container.innerHTML = html;

      container.querySelectorAll('.chip-x').forEach(x => {
        x.addEventListener('click', (e) => {
          const type = e.target.dataset.type;
          this._removeChip(type);
        });
      });
      const clearBtn = document.getElementById('chipClearAll');
      if (clearBtn) clearBtn.addEventListener('click', () => this._clearAll());
    } catch (e) {
      console.error('RenderChips error:', e);
    }
  },

  _removeChip(type) {
    if (type === 'period') {
      Filters.setQuickPeriod('month');
    } else if (type === 'empresa') {
      const el = document.getElementById('empresaFilter');
      if (el) { el.value = 'all'; Filters.updateSucursales(); App.render(); }
    } else if (type === 'sucursal') {
      const el = document.getElementById('sucursalFilter');
      if (el) { el.value = 'all'; App.render(); }
    }
  },

  _clearAll() {
    const emp = document.getElementById('empresaFilter');
    const suc = document.getElementById('sucursalFilter');
    if (emp) emp.value = 'all';
    if (suc) suc.value = 'all';
    Filters.updateSucursales();
    Filters.setQuickPeriod('month');
  }
};

window.RenderChips = RenderChips;