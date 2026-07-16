const Nav = {
  init() {
    try {
      this.initYearBtns();
      this.initSidebarToggle();
      this.initNavItems();
      this.showSection('panorama');
    } catch (e) {
      console.error('Nav init error:', e);
    }
  },

  initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const sbToggle = document.getElementById('sidebarToggle');
    if (!sbToggle || !sidebar) return;

    sbToggle.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
      } else {
        sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('expanded');
      }
    });
  },

  initNavItems() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.showSection(btn.dataset.section));
    });
  },

  showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('section-enter');
      s.style.display = 'none';
    });
    const target = document.getElementById('section-' + sectionId);
    if (target) {
      target.style.display = 'block';
      void target.offsetWidth;
      target.classList.add('section-enter');
    }
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const btn = document.querySelector('.nav-item[data-section="' + sectionId + '"]');
    if (btn) btn.classList.add('active');
    if (window.innerWidth <= 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }
    this._renderSectionContent(sectionId);
  },

  _renderSectionContent(sectionId) {
    try {
      switch(sectionId) {
        case 'panorama':
          ChartEvolucion.render();
          RenderTabla.render();
          break;
        case 'operacion':
          ChartDias.render();
          ChartPlazos.render();
          break;
        case 'clientes':
          RenderClientes.render();
          RenderMotivosFidelizan.render();
          break;
        case 'equipo':
          RenderGestores.render();
          break;
        case 'negocio':
          RenderOfrecimientos.render();
          RenderCategorias.render();
          break;
      }
    } catch (e) {
      console.error('Nav._renderSectionContent error for ' + sectionId + ':', e);
    }
  },

  initYearBtns() {
    const years = [2024, 2025, 2026];
    const configs = [
      { id: 'year-btns-evolucion', key: 'evolucion' },
      { id: 'year-btns-dias', key: 'dias' },
      { id: 'year-btns-plazos', key: 'plazos' },
      { id: 'year-btns-tabla', key: 'tabla' },
      { id: 'year-btns-clientes', key: 'clientes' },
      { id: 'year-btns-gestores', key: 'gestores' },
      { id: 'year-btns-categorias', key: 'categorias' }
    ];

    configs.forEach(config => {
      const container = document.getElementById(config.id);
      if (!container) return;
      container.innerHTML = '';
      const currentYear = State.getChartYear(config.key);
      years.forEach(y => {
        const btn = document.createElement('button');
        btn.className = 'year-btn' + (y === currentYear ? ' active' : '');
        btn.setAttribute('data-year', y);
        btn.textContent = y;
        btn.addEventListener('click', () => this.setChartYear(config.key, y));
        container.appendChild(btn);
      });
    });
  },

  setChartYear(key, y) {
    State.setChartYear(key, y);
    const container = document.getElementById('year-btns-' + key);
    if (container) {
      container.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
      const btn = container.querySelector(`.year-btn[data-year="${y}"]`);
      if (btn) btn.classList.add('active');
    }
    App.render();
  }
};

window.Nav = Nav;