/**
 * Applicazione Slide Viewer per il corso docenti "IA e coding per Informatica e TLC".
 * Architettura a sezione unica (Zen Mode) con dock comandi fluttuante e icone SVG.
 * Realizzata in Vanilla JS (ES6, zero dipendenze esterne).
 */

import { lezioniData } from './data.js';

const THEME_ICONS = {
  auto: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  dark: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  light: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
  'high-contrast': `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"></path></svg>`
};

const THEME_NAMES = {
  auto: 'Automatico (sistema)',
  dark: 'Scuro',
  light: 'Chiaro',
  'high-contrast': 'Alto contrasto'
};

const THEME_CYCLE = ['auto', 'dark', 'light', 'high-contrast'];

class SlideApp {
  constructor() {
    this.state = {
      currentLessonId: null,
      currentSlideIndex: 0,
      isNotesOpen: false,
      isOverviewOpen: false,
      isShortcutsOpen: false,
      isLightboxOpen: false,
      lightboxTriggerEl: null,
      themeMode: this.getSavedTheme()
    };

    // Archivio effimero in memoria volatile per le interazioni d'aula
    this.sessionState = {};

    this.cacheDom();
    this.initTheme();
    this.bindEvents();
    this.initRouter();
    this.startHeartbeat();
  }

  /**
   * Recupera il tema salvato o imposta il valore predefinito
   */
  getSavedTheme() {
    try {
      const saved = localStorage.getItem('corso-ia-theme');
      if (saved && THEME_CYCLE.includes(saved)) {
        return saved;
      }
    } catch {
      // Ignora restrizioni di accesso a localStorage
    }
    return 'auto';
  }

  /**
   * Memorizza i riferimenti agli elementi chiave del DOM
   */
  cacheDom() {
    // Viste principali
    this.dashboardView = document.getElementById('dashboard-view');
    this.viewerView = document.getElementById('viewer-view');
    this.lessonsGrid = document.getElementById('lessons-grid');
    this.slideContainer = document.getElementById('slide-container');

    // Dock comandi fluttuante
    this.floatingDock = document.getElementById('floating-dock');
    this.dockLessonTools = document.getElementById('dock-lesson-tools');
    this.dockCounter = document.getElementById('dock-counter');

    // Pulsanti del dock
    this.btnDockDashboard = document.getElementById('btn-dock-dashboard');
    this.btnDockOverview = document.getElementById('btn-dock-overview');
    this.btnDockIndex = document.getElementById('btn-dock-index');
    this.btnDockNotes = document.getElementById('btn-dock-notes');
    this.btnDockPrint = document.getElementById('btn-dock-print');
    this.btnDockPrev = document.getElementById('btn-dock-prev');
    this.btnDockNext = document.getElementById('btn-dock-next');
    this.btnDockTheme = document.getElementById('btn-dock-theme');
    this.btnDockShortcuts = document.getElementById('btn-dock-shortcuts');

    // Modale note tecniche e approfondimenti
    this.notesModal = document.getElementById('notes-modal');
    this.notesModalContent = document.getElementById('notes-modal-content');
    this.btnCloseNotes = document.getElementById('btn-close-notes');
    this.btnCloseNotesFooter = document.getElementById('btn-close-notes-footer');

    // Modale panoramica slide
    this.overviewModal = document.getElementById('overview-modal');
    this.overviewGrid = document.getElementById('overview-grid');
    this.btnCloseOverview = document.getElementById('btn-close-overview');

    // Modale scorciatoie da tastiera
    this.shortcutsModal = document.getElementById('shortcuts-modal');
    this.btnCloseShortcuts = document.getElementById('btn-close-shortcuts');
    this.btnCloseShortcutsFooter = document.getElementById('btn-close-shortcuts-footer');

    // Media Lightbox per ingrandire immagini a schermo intero
    this.mediaLightbox = document.getElementById('media-lightbox');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.btnCloseLightbox = document.getElementById('btn-close-lightbox');
    this.lightboxViewport = document.getElementById('lightbox-viewport');

    // Contenitore dedicato alla stampa
    this.printContainer = document.getElementById('print-container');
  }

  /**
   * Associa tutti i gestori di eventi per mouse, tastiera e routing
   */
  bindEvents() {
    // Navigazione dock
    this.btnDockDashboard.addEventListener('click', () => this.navigate('#dashboard'));
    this.btnDockPrev.addEventListener('click', () => this.prevSlide());
    this.btnDockNext.addEventListener('click', () => this.nextSlide());
    this.btnDockOverview.addEventListener('click', () => this.openOverview());
    if (this.btnDockIndex) {
      this.btnDockIndex.addEventListener('click', () => this.goToIndice());
    }
    this.btnDockNotes.addEventListener('click', () => this.openNotes());
    this.btnDockPrint.addEventListener('click', () => this.printLesson());
    if (this.btnDockTheme) {
      this.btnDockTheme.addEventListener('click', () => this.cycleTheme());
    }
    this.btnDockShortcuts.addEventListener('click', () => this.openShortcuts());

    // Chiusura modale approfondimenti
    this.btnCloseNotes.addEventListener('click', () => this.closeNotes());
    this.btnCloseNotesFooter.addEventListener('click', () => this.closeNotes());
    this.notesModal.addEventListener('click', (e) => {
      if (e.target === this.notesModal) this.closeNotes();
    });

    // Chiusura modale panoramica
    this.btnCloseOverview.addEventListener('click', () => this.closeOverview());
    this.overviewModal.addEventListener('click', (e) => {
      if (e.target === this.overviewModal) this.closeOverview();
    });

    // Chiusura modale scorciatoie
    this.btnCloseShortcuts.addEventListener('click', () => this.closeShortcuts());
    this.btnCloseShortcutsFooter.addEventListener('click', () => this.closeShortcuts());
    this.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === this.shortcutsModal) this.closeShortcuts();
    });

    // Chiusura Media Lightbox
    if (this.btnCloseLightbox) {
      this.btnCloseLightbox.addEventListener('click', () => this.closeLightbox());
    }
    if (this.mediaLightbox) {
      this.mediaLightbox.addEventListener('click', (e) => {
        if (e.target === this.mediaLightbox || e.target === this.lightboxViewport) {
          this.closeLightbox();
        }
      });
    }

    // Ascolto cambio tema di sistema per la modalità automatica
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.state.themeMode === 'auto') {
          this.applyTheme('auto');
        }
      });
    }

    // Navigazione globale da tastiera
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Ascolto cambi hash URL per supportare cronologia e deeplinking
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  /**
   * Inizializza il tema visivo applicando la configurazione attiva
   */
  initTheme() {
    this.applyTheme(this.state.themeMode);
  }

  /**
   * Cicla il tema visivo nella sequenza auto -> dark -> light -> high-contrast
   */
  cycleTheme() {
    const currentIndex = THEME_CYCLE.indexOf(this.state.themeMode);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    const nextTheme = THEME_CYCLE[nextIndex];
    this.applyTheme(nextTheme);
  }

  /**
   * Applica il tema specificato aggiornando attributi DOM, icona e tooltip
   */
  applyTheme(themeMode) {
    if (!THEME_CYCLE.includes(themeMode)) {
      themeMode = 'auto';
    }
    this.state.themeMode = themeMode;
    try {
      localStorage.setItem('corso-ia-theme', themeMode);
    } catch {
      // Ignora restrizioni di accesso a localStorage
    }

    let resolvedTheme = themeMode;
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-mode', themeMode);

    if (this.btnDockTheme) {
      this.btnDockTheme.innerHTML = THEME_ICONS[themeMode];
      const name = THEME_NAMES[themeMode];
      this.btnDockTheme.setAttribute('data-tooltip', `Tema: ${name} [T]`);
      this.btnDockTheme.setAttribute('aria-label', `Tema visivo: ${name}. Premi per cambiare [T]`);
    }
  }

  /**
   * Determina la data/ora corrente supportando parametri di simulazione o collaudo (?now=... o ?preview=true)
   */
  getCurrentTime() {
    const params = new URLSearchParams(window.location.search);
    const nowParam = params.get('now');
    if (nowParam) {
      const parsed = new Date(nowParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (params.get('preview') === 'true') {
      return new Date('2099-01-01T00:00:00');
    }
    return new Date();
  }

  /**
   * Verifica se una lezione e attiva e accessibile
   * Regola: attiva solo se lezione.attiva === true E orario di inizio raggiunto o superato
   */
  isLessonActive(lezione) {
    if (!lezione || !lezione.attiva) return false;
    if (!lezione.inizio) return true;
    const startTime = new Date(lezione.inizio);
    if (isNaN(startTime.getTime())) return true;
    return this.getCurrentTime() >= startTime;
  }

  /**
   * Avvia il timer di heartbeat per l'attivazione in tempo reale delle lezioni nella dashboard
   */
  startHeartbeat() {
    setInterval(() => {
      if (this.state.currentLessonId === null) {
        this.renderDashboard();
      }
    }, 30000);
  }

  /**
   * Inizializza il router controllando lo stato iniziale della pagina
   */
  initRouter() {
    this.renderDashboard();
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#dashboard') {
      this.showDashboard();
    } else {
      this.handleHashChange();
    }
  }

  /**
   * Gestisce il cambio di percorso in base all'hash dell'URL
   */
  handleHashChange() {
    const hash = window.location.hash;

    if (!hash || hash === '#dashboard' || hash === '#') {
      this.showDashboard();
      return;
    }

    // Corrispondenza pattern: #/lezione/:id/slide/:num oppure #/lezione/:id
    const match = hash.match(/^#\/lezione\/(\d+)(?:\/slide\/(\d+))?$/);

    if (match) {
      const lessonId = parseInt(match[1], 10);
      const slideNum = match[2] ? parseInt(match[2], 10) : 1;

      const lesson = lezioniData.find(l => l.id === lessonId);

      if (lesson && this.isLessonActive(lesson) && lesson.slides.length > 0) {
        const slideIndex = Math.max(0, Math.min(slideNum - 1, lesson.slides.length - 1));
        this.showLesson(lessonId, slideIndex);
      } else {
        // Lezione non disponibile o inattiva: ritorna alla dashboard
        this.navigate('#dashboard');
      }
    } else {
      this.navigate('#dashboard');
    }
  }

  /**
   * Modifica l'hash dell'URL in modo sicuro
   */
  navigate(newHash) {
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      this.handleHashChange();
    }
  }

  /**
   * Renderizza la griglia delle lezioni nella dashboard
   */
  renderDashboard() {
    this.lessonsGrid.innerHTML = '';

    lezioniData.forEach((lezione) => {
      const isActive = this.isLessonActive(lezione);

      const card = document.createElement('article');
      card.className = `lesson-card ${isActive ? 'active' : 'disabled'}`;
      card.setAttribute('tabindex', isActive ? '0' : '-1');
      card.setAttribute('aria-disabled', isActive ? 'false' : 'true');

      const statusIndicator = isActive
        ? '<span class="lesson-meta-status active">Disponibile</span>'
        : '<span class="lesson-meta-status disabled">In arrivo</span>';

      let scheduleHtml = '';
      if (lezione.programmazione) {
        const parts = lezione.programmazione.split(' · ');
        if (parts.length === 2) {
          scheduleHtml = `
            <div class="lesson-schedule-multiline">
              <span class="lesson-schedule-date">${parts[0]}</span>
              <span class="lesson-schedule-time">${parts[1]}</span>
            </div>
          `;
        } else {
          scheduleHtml = `
            <div class="lesson-schedule-multiline">
              <span class="lesson-schedule-date">${lezione.programmazione}</span>
            </div>
          `;
        }
      }

      card.innerHTML = `
        <div class="lesson-card-top">
          <span class="lesson-number">Lezione ${lezione.id}</span>
          <div class="lesson-meta">
            <span class="lesson-meta-duration">${lezione.durata}</span>
            <span class="lesson-meta-dot">&middot;</span>
            ${statusIndicator}
          </div>
        </div>
        <h2>${lezione.titolo}</h2>
        <p>${lezione.descrizione}</p>
        <div class="lesson-card-footer">
          <div class="lesson-footer-info">
            ${scheduleHtml}
          </div>
          <div class="lesson-footer-action">
            <button class="btn ${isActive ? 'btn-primary' : ''}" ${isActive ? '' : 'disabled'}>
              ${isActive ? 'Avvia lezione &rarr;' : 'Programmata'}
            </button>
          </div>
        </div>
      `;

      if (isActive) {
        const startAction = () => this.navigate(`#/lezione/${lezione.id}/slide/1`);
        card.addEventListener('click', startAction);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startAction();
          }
        });
      }

      this.lessonsGrid.appendChild(card);
    });
  }

  /**
   * Mostra la dashboard a sezione unica e adatta i comandi del dock
   */
  showDashboard() {
    this.closeNotes();
    this.closeOverview();
    this.closeShortcuts();

    this.state.currentLessonId = null;
    this.dashboardView.style.display = 'block';
    this.viewerView.style.display = 'none';

    // Nasconde i controlli specifici della lezione nel dock
    this.dockLessonTools.style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Recupera o inizializza lo stato di sessione per la slide specificata
   */
  getSlideState(lessonId, slideIndex, defaultState = {}) {
    if (!this.sessionState[lessonId]) {
      this.sessionState[lessonId] = {};
    }
    if (!this.sessionState[lessonId][slideIndex]) {
      this.sessionState[lessonId][slideIndex] = { ...defaultState };
    }
    return this.sessionState[lessonId][slideIndex];
  }

  /**
   * Aggiorna lo stato di sessione per una specifica slide
   */
  updateSlideState(lessonId, slideIndex, patch) {
    const current = this.getSlideState(lessonId, slideIndex);
    this.sessionState[lessonId][slideIndex] = { ...current, ...patch };
  }

  /**
   * Mostra il visualizzatore slide a sezione unica per la lezione selezionata
   */
  showLesson(lessonId, slideIndex) {
    this.state.currentLessonId = lessonId;
    this.state.currentSlideIndex = slideIndex;

    const lesson = lezioniData.find(l => l.id === lessonId);
    if (!lesson || !lesson.slides || lesson.slides.length === 0) return;

    this.dashboardView.style.display = 'none';
    this.viewerView.style.display = 'flex';

    // Mostra i comandi specifici della lezione nel dock fluttuante
    this.dockLessonTools.style.display = 'flex';

    const totalSlides = lesson.slides.length;
    const currentSlide = lesson.slides[slideIndex];
    const tipo = (currentSlide.tipo || 'CONTENUTO').toUpperCase();
    const isFullImpact = ['COPERTINA', 'SEZIONE', 'CONCLUSIONI', 'COVER', 'SECTION', 'CLOSING'].includes(tipo);

    // Aggiornamento contatore nel dock
    this.dockCounter.textContent = `${slideIndex + 1} / ${totalSlides}`;

    // Disabilitazione pulsanti ai bordi
    this.btnDockPrev.disabled = (slideIndex === 0);
    this.btnDockNext.disabled = (slideIndex === totalSlides - 1);

    // Aggiornamento stato e tooltip pulsante Indice nel Dock
    if (this.btnDockIndex) {
      const indiceIdx = this.findIndiceSlideIndex(lesson);

      if (indiceIdx === -1) {
        this.btnDockIndex.disabled = true;
        this.btnDockIndex.setAttribute('data-tooltip', 'Nessun indice per questa lezione');
        this.btnDockIndex.setAttribute('aria-label', 'Nessun indice per questa lezione');
      } else if (slideIndex === indiceIdx) {
        this.btnDockIndex.disabled = true;
        this.btnDockIndex.setAttribute('data-tooltip', 'Sei già all\'indice [I]');
        this.btnDockIndex.setAttribute('aria-label', 'Sei già all\'indice della lezione');
      } else {
        this.btnDockIndex.disabled = false;
        this.btnDockIndex.setAttribute('data-tooltip', 'Indice lezione [I]');
        this.btnDockIndex.setAttribute('aria-label', 'Salta all\'indice della lezione');
      }
    }

    // Imposta classi del container in base alla tipologia e allo stile di impatto
    this.slideContainer.className = `slide-container slide-type-${tipo.toLowerCase()} ${isFullImpact ? 'full-impact' : ''}`;

    // Intestazione contestuale (visibile solo nelle slide ordinarie, omessa nelle Full-Impact)
    let headerHtml = '';
    if (!isFullImpact) {
      headerHtml = `
        <div class="slide-header-meta">
          <span class="slide-lesson-tag">Lezione ${lesson.id} / ${lesson.titolo}</span>
          <!--span class="slide-page-badge">${slideIndex + 1} di ${totalSlides}</span-->
        </div>
      `;
    }

    // Rendering dinamico del contenuto per tipologia
    const contentHtml = this.renderSlideContent(currentSlide, lessonId, slideIndex);
    this.slideContainer.innerHTML = headerHtml + contentHtml;

    // Attivazione ascoltatori per componenti interattivi
    this.attachSlideInteractions(currentSlide, lessonId, slideIndex);

    // Se la finestra approfondimenti e aperta, aggiorna subito il contenuto
    if (this.state.isNotesOpen) {
      this.updateNotesContent();
    }

    // Se la panoramica e aperta, aggiorna la selezione visiva
    if (this.state.isOverviewOpen) {
      this.updateOverviewActiveState();
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Pulisce frammenti HTML legacy da eventuali badge e titoli h2 duplicati
   */
  cleanLegacyHtml(html) {
    if (!html || typeof html !== 'string') return '';
    return html
      .replace(/<div\s+class=['"][^'"]*slide-badge[^'"]*['"][^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, '')
      .trim();
  }

  /**
   * Smista il rendering in base alla tipologia semantica della slide
   */
  renderSlideContent(slide, lessonId, slideIndex) {
    const tipo = (slide.tipo || 'CONTENUTO').toUpperCase();

    switch (tipo) {
      case 'COPERTINA':
      case 'COVER':
        return this.renderCopertina(slide);
      case 'INDICE':
      case 'AGENDA':
        return this.renderIndice(slide, lessonId);
      case 'SEZIONE':
      case 'SECTION':
        return this.renderSezione(slide);
      case 'CONCLUSIONI':
      case 'CLOSING':
        return this.renderConclusioni(slide);
      case 'CONTENUTO':
      case 'CONTENT':
        return this.renderContenuto(slide);
      case 'GRIGLIA':
      case 'GRID':
      case 'COLONNE':
      case 'SPLIT':
      case 'CONFRONTO':
      case 'VS':
        return this.renderGriglia(slide);
      case 'BIVIO':
      case 'DUO':
        return this.renderBivio(slide, lessonId, slideIndex);
      case 'SEQUENZA':
      case 'CYCLE':
        return this.renderSequenza(slide, lessonId, slideIndex);
      case 'TABELLA':
      case 'TABLE':
        return this.renderTabella(slide);
      case 'LISTA_SPUNTA':
      case 'CHECKLIST':
        return this.renderListaSpunta(slide, lessonId, slideIndex);
      case 'FIGURA':
      case 'FIGURE':
      case 'IMAGE':
        return this.renderFigura(slide);
      case 'ANIMAZIONE':
      case 'ANIMATION':
        return this.renderAnimazione(slide);
      case 'LABORATORIO':
      case 'LAB':
        return this.renderLaboratorio(slide);
      case 'VERIFICA':
      case 'QUIZ':
        return this.renderVerifica(slide, lessonId, slideIndex);
      case 'ENUNCIATO':
      case 'STATEMENT':
        return this.renderEnunciato(slide);
      case 'ATTENZIONE':
      case 'WARN':
        return this.renderAttenzione(slide);
      case 'CITAZIONE':
      case 'QUOTE':
        return this.renderCitazione(slide);
      default:
        return this.renderGeneral(slide, tipo);
    }
  }

  renderCopertina(slide) {
    const badge = slide.badge || "";
    const lead = slide.sottotitolo || slide.lead || "";
    let metaHtml = "";
    if (slide.metadati && Array.isArray(slide.metadati)) {
      metaHtml = `
        <div class="cover-meta-grid">
          ${slide.metadati.map((m, idx) => `
            <div class="cover-meta-item stagger-item" style="--stagger-index: ${idx}">
              <div class="cover-meta-label">${m.label}</div>
              <div class="cover-meta-value">${m.valore}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${metaHtml}
    `;
  }
  renderCover(slide) { return this.renderCopertina(slide); }

  renderIndice(slide, lessonId) {
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    let items = [];
    if (slide.voci && Array.isArray(slide.voci)) {
      items = slide.voci;
    } else if (slide.punti && Array.isArray(slide.punti)) {
      items = slide.punti.map((p, idx) => ({ numero: idx + 1, titolo: p }));
    } else if (slide.contenuto) {
      const liMatches = [...slide.contenuto.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
      if (liMatches.length > 0) {
        items = liMatches.map((m, idx) => ({ numero: idx + 1, titolo: m[1].replace(/<[^>]+>/g, '').trim() }));
      }
    }

    const currentLesson = lezioniData.find(l => l.id === (lessonId || this.state.currentLessonId));
    const slidesList = currentLesson ? currentLesson.slides : [];

    let vociHtml = "";
    if (items.length > 0) {
      vociHtml = `
        <div class="indice-container">
          <div class="indice-table">
            ${items.map((v, idx) => {
        const num = typeof v === 'object' && v.numero ? v.numero : idx + 1;
        const formattedNum = String(num).padStart(2, '0');
        const title = typeof v === 'object' ? (v.testo || v.titolo) : v;
        const desc = typeof v === 'object' && v.descrizione ? `<span class="indice-item-desc">${v.descrizione}</span>` : '';

        // Collegamento con la corrispondente slide di tipo SEZIONE
        let targetSlideNumber = null;
        if (slidesList && slidesList.length > 0) {
          const targetIdx = slidesList.findIndex(s => {
            const sTipo = (s.tipo || '').toUpperCase();
            if (sTipo !== 'SEZIONE' && sTipo !== 'SECTION') return false;

            const sNum = s.numeroSezione || (s.titolo.match(/^(\d+)/) ? s.titolo.match(/^(\d+)/)[1] : "");
            if (sNum && parseInt(sNum, 10) === parseInt(num, 10)) {
              return true;
            }

            const cleanSTitle = (s.titolo || '').replace(/^\d+\s*[-:.]?\s*/, '').toLowerCase().trim();
            const cleanTitle = (title || '').replace(/^\d+\s*[-:.]?\s*/, '').toLowerCase().trim();
            return cleanSTitle && cleanTitle && (cleanSTitle.includes(cleanTitle) || cleanTitle.includes(cleanSTitle));
          });

          if (targetIdx !== -1) {
            targetSlideNumber = targetIdx + 1;
          }
        }

        const isClickable = targetSlideNumber !== null;
        const targetAttr = isClickable
          ? `data-target-slide="${targetSlideNumber}" tabindex="0" role="button" aria-label="Vai alla sezione ${formattedNum}: ${title}"`
          : '';
        const clickableClass = isClickable ? 'is-clickable' : '';

        return `
                <div class="indice-row stagger-item ${clickableClass}" style="--stagger-index: ${idx}" ${targetAttr}>
                  <div class="indice-row-left">
                    <span class="indice-num">${formattedNum}</span>
                    <div class="indice-text-block">
                      <span class="indice-item-title">${title}</span>
                      ${desc}
                    </div>
                  </div>
                  ${isClickable ? `
                  <div class="indice-row-arrow">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                  ` : ''}
                </div>
              `;
      }).join('')}
          </div>
        </div>
      `;
    } else {
      vociHtml = this.cleanLegacyHtml(slide.contenuto || '');
    }

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${vociHtml}
    `;
  }
  renderAgenda(slide, lessonId) { return this.renderIndice(slide, lessonId); }

  renderSezione(slide) {
    const rawNum = slide.numeroSezione || (slide.titolo.match(/^(\d+)/) ? slide.titolo.match(/^(\d+)/)[1] : "");
    const formattedNum = rawNum ? String(rawNum).padStart(2, '0') : "";
    const cleanTitle = slide.titolo.replace(/^\d+\s*[-:.]?\s*/, '');
    const lead = slide.descrizione || slide.lead || "";
    const hasCustomBadge = slide.badge && !slide.badge.match(/^sezione\s*\d*$/i) && slide.badge.trim() !== formattedNum;

    return `
      <div class="section-layout-container">
        ${hasCustomBadge ? `<div class="slide-badge">${slide.badge}</div>` : ''}
        <div class="section-hero-row">
          ${formattedNum ? `<div class="section-number-display">${formattedNum}</div>` : ''}
          <div class="section-divider-line"></div>
        </div>
        <h2 class="section-title">${cleanTitle}</h2>
        ${lead ? `<p class="slide-lead section-lead">${lead}</p>` : ''}
      </div>
    `;
  }
  renderSection(slide) { return this.renderSezione(slide); }

  renderConclusioni(slide) {
    const badge = slide.badge || "";
    const msg = slide.messaggio || slide.lead || "La sessione didattica è terminata con successo.";
    return `
      <div class="closing-container">
        <div class="closing-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
        <h2>${slide.titolo}</h2>
        <p class="slide-lead">${msg}</p>
      </div>
    `;
  }
  renderClosing(slide) { return this.renderConclusioni(slide); }

  renderContenuto(slide) {
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    let bodyHtml = "";
    if (slide.paragrafi && Array.isArray(slide.paragrafi)) {
      bodyHtml += slide.paragrafi.map(p => `<p class="slide-body">${p}</p>`).join('');
    }
    if (slide.puntiChiave && Array.isArray(slide.puntiChiave)) {
      bodyHtml += `
        <ul class="colonne-card-list">
          ${slide.puntiChiave.map(pk => `<li>${pk}</li>`).join('')}
        </ul>
      `;
    }
    if (!bodyHtml && slide.contenuto) {
      bodyHtml = this.cleanLegacyHtml(slide.contenuto);
    }
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${bodyHtml}
    `;
  }
  renderContent(slide) { return this.renderContenuto(slide); }

  renderGriglia(slide) {
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    let gridHtml = "";
    const rawSchede = slide.schede || slide.colonne || (slide.sinistra && slide.destra ? [
      { ...slide.sinistra, evidenza: slide.sinistra.evidenza || slide.sinistra.tag },
      { ...slide.destra, evidenza: slide.destra.evidenza || slide.destra.tag }
    ] : null);

    if (rawSchede && Array.isArray(rawSchede)) {
      gridHtml = `
        <div class="card-grid">
          ${rawSchede.map((s, idx) => `
            <div class="card stagger-item" style="--stagger-index: ${idx}">
              ${(s.evidenza || s.tag) ? `<span class="cycle-role-pill">${s.evidenza || s.tag}</span>` : ''}
              <h3>${s.titolo}</h3>
              ${s.testo ? `<p>${s.testo}</p>` : ''}
              ${s.punti && Array.isArray(s.punti) ? `
                <ul class="colonne-card-list">
                  ${s.punti.map(pt => `<li>${pt}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    } else {
      gridHtml = this.cleanLegacyHtml(slide.contenuto || '');
    }
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${gridHtml}
    `;
  }
  renderGrid(slide) { return this.renderGriglia(slide); }

  renderColonne(slide) {
    return this.renderGriglia(slide);
  }
  renderSplit(slide) { return this.renderGriglia(slide); }

  renderConfronto(slide) {
    return this.renderGriglia(slide);
  }
  renderVs(slide) { return this.renderGriglia(slide); }

  renderVerifica(slide, lessonId, slideIndex) {
    const state = this.getSlideState(lessonId, slideIndex, { selectedId: null, answered: false });
    const badge = slide.badge || "";
    const domanda = slide.domanda || slide.titolo;
    const opzioni = slide.opzioni || [];

    const optionsHtml = opzioni.map((opt, idx) => {
      let extraClass = '';
      if (state.answered) {
        extraClass = 'locked ';
        if (opt.id === state.selectedId) {
          extraClass += opt.corretta ? 'correct' : 'incorrect';
        } else if (opt.corretta) {
          extraClass += 'reveal-correct';
        }
      }
      return `
        <div class="quiz-option stagger-item ${extraClass}" style="--stagger-index: ${idx}" data-option-id="${opt.id}" tabindex="0">
          <span class="quiz-option-letter">${opt.id}</span>
          <span class="quiz-option-text">${opt.testo}</span>
        </div>
      `;
    }).join('');

    let feedbackHtml = '';
    if (state.answered) {
      const selectedOpt = opzioni.find(o => o.id === state.selectedId);
      const isCorrect = selectedOpt && selectedOpt.corretta;
      feedbackHtml = `
        <div class="quiz-feedback ${isCorrect ? 'status-correct' : 'status-incorrect'}">
          <div class="quiz-feedback-header">
            <span class="quiz-feedback-title">
              ${isCorrect ? '✓ Risposta corretta!' : '✗ Risposta non corretta'}
            </span>
            <button class="btn-quiz-retry" id="btn-quiz-retry">Riprova il quiz</button>
          </div>
          <p class="quiz-feedback-desc">${slide.spiegazione || 'Riflessione completata.'}</p>
        </div>
      `;
    }

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      <div class="quiz-container">
        <div class="quiz-question-box">
          <p class="quiz-question-text">${domanda}</p>
        </div>
        <div class="quiz-options-grid">
          ${optionsHtml}
        </div>
        ${feedbackHtml}
      </div>
    `;
  }
  renderQuiz(slide, lessonId, slideIndex) { return this.renderVerifica(slide, lessonId, slideIndex); }

  renderListaSpunta(slide, lessonId, slideIndex) {
    const state = this.getSlideState(lessonId, slideIndex, { checked: {} });
    const elementi = slide.elementi || [];
    const total = elementi.length;
    const checkedCount = elementi.filter(el => state.checked[el.id]).length;
    const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    const badge = slide.badge || "";
    const lead = slide.lead || "";

    const itemsHtml = elementi.map((el, idx) => {
      const isChecked = !!state.checked[el.id];
      return `
        <div class="checklist-item stagger-item ${isChecked ? 'is-checked' : ''}" style="--stagger-index: ${idx}" data-item-id="${el.id}" tabindex="0">
          <div class="checklist-box">
            ${isChecked ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
          <span class="checklist-text">${el.testo}</span>
        </div>
      `;
    }).join('');

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      <div class="checklist-container">
        <div class="checklist-tracker">
          <div class="checklist-tracker-info">
            <span>Avanzamento procedurale:</span>
            <strong>${checkedCount} su ${total} completati (${percent}%)</strong>
          </div>
          <div class="checklist-progress-track">
            <div class="checklist-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
        <div class="checklist-items-list">
          ${itemsHtml}
        </div>
      </div>
    `;
  }
  renderChecklist(slide, lessonId, slideIndex) { return this.renderListaSpunta(slide, lessonId, slideIndex); }

  renderSequenza(slide, lessonId, slideIndex) {
    const steps = slide.step || [];
    const state = this.getSlideState(lessonId, slideIndex, { activeIndex: 0 });
    const activeIndex = Math.min(Math.max(0, state.activeIndex || 0), Math.max(0, steps.length - 1));
    const currentStep = steps[activeIndex] || { numero: 1, fase: "", descrizione: "", ruolo: "" };
    const badge = slide.badge || "";
    const lead = slide.lead || "";

    const dotsHtml = steps.map((s, idx) => `
      <button class="cycle-dot ${idx === activeIndex ? 'active' : ''}" data-cycle-step="${idx}" aria-label="Fase ${idx + 1}" title="Fase ${idx + 1}: ${s.fase}"></button>
    `).join('');

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      <div class="cycle-container">
        <div class="cycle-card">
          <div>
            <div class="cycle-step-header">
              <span class="cycle-step-pill">Fase ${currentStep.numero || activeIndex + 1} di ${steps.length}</span>
              ${currentStep.ruolo ? `<span class="cycle-role-pill">${currentStep.ruolo}</span>` : ''}
            </div>
            <h3 class="cycle-step-title">${currentStep.fase}</h3>
            <p class="cycle-step-desc">${currentStep.descrizione}</p>
          </div>
          <div class="cycle-footer">
            <div class="cycle-dots">
              ${dotsHtml}
            </div>
            <div class="cycle-nav">
              <button class="cycle-nav-btn" id="btn-cycle-prev" ${activeIndex === 0 ? 'disabled' : ''} aria-label="Fase precedente">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="cycle-nav-btn" id="btn-cycle-next" ${activeIndex === steps.length - 1 ? 'disabled' : ''} aria-label="Fase successiva">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  renderCycle(slide, lessonId, slideIndex) { return this.renderSequenza(slide, lessonId, slideIndex); }

  renderBivio(slide, lessonId, slideIndex) {
    const state = this.getSlideState(lessonId, slideIndex, { activeSide: 'A' });
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    const opA = slide.opzioneA || {};
    const opB = slide.opzioneB || {};
    const isA = state.activeSide === 'A';

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      <div class="duo-container">
        <div class="duo-switch-bar">
          <button class="duo-toggle-btn ${isA ? 'active' : ''}" data-duo-side="A">${opA.etichetta || 'Opzione A'}</button>
          <button class="duo-toggle-btn ${!isA ? 'active' : ''}" data-duo-side="B">${opB.etichetta || 'Opzione B'}</button>
        </div>
        <div class="duo-cards-grid">
          <div class="duo-card ${isA ? 'active' : 'dimmed'}" data-duo-target="A">
            <span class="duo-card-badge">${opA.sottotitolo || 'Opzione A'}</span>
            <h3 class="duo-card-title">${opA.etichetta || 'Opzione A'}</h3>
            ${opA.testo ? `<div class="duo-card-prompt">${opA.testo}</div>` : ''}
            ${opA.esito ? `<p class="duo-card-outcome">${opA.esito}</p>` : ''}
          </div>
          <div class="duo-card ${!isA ? 'active' : 'dimmed'}" data-duo-target="B">
            <span class="duo-card-badge">${opB.sottotitolo || 'Opzione B'}</span>
            <h3 class="duo-card-title">${opB.etichetta || 'Opzione B'}</h3>
            ${opB.testo ? `<div class="duo-card-prompt">${opB.testo}</div>` : ''}
            ${opB.esito ? `<p class="duo-card-outcome">${opB.esito}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }
  renderDuo(slide, lessonId, slideIndex) { return this.renderBivio(slide, lessonId, slideIndex); }

  renderTabella(slide) {
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    const colonne = slide.colonne || [];
    const righe = slide.righe || [];

    let tableHtml = '';
    if (colonne.length > 0) {
      tableHtml = `
        <div class="slide-table-container stagger-item" style="--stagger-index: 0">
          <table class="slide-table">
            <thead>
              <tr>${colonne.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${righe.map(r => `<tr>${r.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${tableHtml}
    `;
  }
  renderTable(slide) { return this.renderTabella(slide); }

  renderFigura(slide) {
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    let figHtml = "";
    if (slide.media) {
      const m = slide.media;
      figHtml = `
        <div class="figura-container">
          <div class="figura-media-box stagger-item" style="--stagger-index: 0">
            <img class="figura-img" src="${m.sorgente || m.url}" alt="${m.alt || slide.titolo}" tabindex="0" role="button" aria-label="Clicca per ingrandire l'immagine a schermo intero" />
            ${m.didascalia ? `<p class="figura-caption">${m.didascalia}</p>` : ''}
          </div>
          ${slide.commento ? `<div class="figura-commento stagger-item" style="--stagger-index: 1">${slide.commento}</div>` : ''}
        </div>
      `;
    } else {
      figHtml = this.cleanLegacyHtml(slide.contenuto || '');
    }
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${figHtml}
    `;
  }
  renderFigure(slide) { return this.renderFigura(slide); }
  renderImage(slide) { return this.renderFigura(slide); }

  renderAnimazione(slide) {
    const badge = slide.badge || "";
    const lead = slide.lead || "";
    let animHtml = "";
    if (slide.sorgenteAnimazione || (slide.spiegazioneFasi && Array.isArray(slide.spiegazioneFasi))) {
      let visualHtml = "";
      const src = slide.sorgenteAnimazione || "";
      if (src.startsWith("data:image/") || src.startsWith("http") || src.endsWith(".svg") || src.endsWith(".gif")) {
        visualHtml = `
          <div class="figura-media-box stagger-item" style="--stagger-index: 0">
            <img class="figura-img" src="${src}" alt="${slide.alt || slide.titolo}" tabindex="0" role="button" aria-label="Clicca per ingrandire l'immagine a schermo intero" />
            ${slide.didascalia ? `<p class="figura-caption">${slide.didascalia}</p>` : ''}
          </div>
        `;
      } else if (src.trim().startsWith("<svg")) {
        visualHtml = `
          <div class="figura-media-box stagger-item" style="--stagger-index: 0">
            ${src}
            ${slide.didascalia ? `<p class="figura-caption">${slide.didascalia}</p>` : ''}
          </div>
        `;
      }
      animHtml = `
        <div class="animazione-container">
          ${visualHtml}
          ${slide.spiegazioneFasi && Array.isArray(slide.spiegazioneFasi) ? `
            <div class="indice-grid">
              ${slide.spiegazioneFasi.map((f, idx) => `
                <div class="indice-item stagger-item" style="--stagger-index: ${idx + 1}">
                  <span class="indice-num">${idx + 1}</span>
                  <span class="indice-item-title">${f}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      animHtml = this.cleanLegacyHtml(slide.contenuto || '');
    }
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${animHtml}
    `;
  }
  renderAnimation(slide) { return this.renderAnimazione(slide); }

  parseMarkdownToHtml(md) {
    if (!md) return "";
    const lines = md.split(/\r?\n/);
    const html = [];
    let inCodeBlock = false;
    let codeBlockContent = [];
    let inList = false;
    let listType = "ul";

    const closeList = () => {
      if (inList) {
        html.push(`</${listType}>`);
        inList = false;
      }
    };

    const escapeHtml = (str) => {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const formatInline = (text) => {
      let res = escapeHtml(text);
      res = res.replace(/`([^`]+)`/g, '<code class="preview-inline-code">$1</code>');
      res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return res;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        closeList();
        if (inCodeBlock) {
          html.push(`<pre class="preview-code-block"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`);
          inCodeBlock = false;
          codeBlockContent = [];
        } else {
          inCodeBlock = true;
          codeBlockContent = [];
        }
        continue;
      }
      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      const trimmed = line.trim();

      if (!trimmed) {
        closeList();
        continue;
      }

      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        closeList();
        html.push('<hr class="preview-hr">');
        continue;
      }

      if (trimmed.startsWith("# ")) {
        closeList();
        html.push(`<h3 class="preview-h1">${formatInline(trimmed.slice(2))}</h3>`);
        continue;
      }
      if (trimmed.startsWith("## ")) {
        closeList();
        html.push(`<h4 class="preview-h2">${formatInline(trimmed.slice(3))}</h4>`);
        continue;
      }
      if (trimmed.startsWith("### ")) {
        closeList();
        html.push(`<h5 class="preview-h3">${formatInline(trimmed.slice(4))}</h5>`);
        continue;
      }
      if (trimmed.startsWith("#### ")) {
        closeList();
        html.push(`<h6 class="preview-h4">${formatInline(trimmed.slice(5))}</h6>`);
        continue;
      }

      if (trimmed.startsWith("> ")) {
        closeList();
        html.push(`<blockquote class="preview-blockquote">${formatInline(trimmed.slice(2))}</blockquote>`);
        continue;
      }

      const taskCheckedMatch = trimmed.match(/^[-*]\s+\[x\]\s+(.*)$/i);
      if (taskCheckedMatch) {
        if (!inList || listType !== "ul") {
          closeList();
          html.push('<ul class="preview-list preview-task-list">');
          inList = true;
          listType = "ul";
        }
        html.push(`<li class="preview-task-item checked"><span class="preview-check-badge checked">✓</span> ${formatInline(taskCheckedMatch[1])}</li>`);
        continue;
      }

      const taskUncheckedMatch = trimmed.match(/^[-*]\s+\[\s*\]\s+(.*)$/);
      if (taskUncheckedMatch) {
        if (!inList || listType !== "ul") {
          closeList();
          html.push('<ul class="preview-list preview-task-list">');
          inList = true;
          listType = "ul";
        }
        html.push(`<li class="preview-task-item unchecked"><span class="preview-check-badge unchecked">☐</span> ${formatInline(taskUncheckedMatch[1])}</li>`);
        continue;
      }

      const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        if (!inList || listType !== "ul") {
          closeList();
          html.push('<ul class="preview-list">');
          inList = true;
          listType = "ul";
        }
        html.push(`<li>${formatInline(ulMatch[1])}</li>`);
        continue;
      }

      const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        if (!inList || listType !== "ol") {
          closeList();
          html.push('<ol class="preview-list">');
          inList = true;
          listType = "ol";
        }
        html.push(`<li>${formatInline(olMatch[2])}</li>`);
        continue;
      }

      closeList();
      html.push(`<p class="preview-p">${formatInline(trimmed)}</p>`);
    }

    closeList();
    if (inCodeBlock) {
      html.push(`<pre class="preview-code-block"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`);
    }

    return html.join("\n");
  }

  renderLaboratorio(slide) {
    const badge = slide.badge || "";
    const lead = slide.lead || slide.descrizione || "";
    let labHtml = "";

    const hasExample = Boolean(slide.esempioMarkdown);
    const hasPrompt = Boolean(slide.promptEsempio || slide.templateMarkdown);
    const templateContent = slide.templateMarkdown || slide.promptEsempio || "";
    const downloadFilename = slide.downloadNome || (slide.titolo ? slide.titolo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".md" : "template.md");

    const escapeHtml = (str) => {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    if (slide.obiettivo || slide.passi || hasExample || hasPrompt) {
      const renderedPreview = hasExample
        ? this.parseMarkdownToHtml(slide.esempioMarkdown)
        : (templateContent ? this.parseMarkdownToHtml(templateContent) : "");

      labHtml = `
        <div class="laboratorio-container">
          <div class="laboratorio-meta-box stagger-item" style="--stagger-index: 0">
            ${slide.obiettivo ? `<div class="laboratorio-obiettivo">Obiettivo: ${slide.obiettivo}</div>` : ''}
            ${slide.contesto ? `<div class="laboratorio-contesto">Contesto: ${slide.contesto}</div>` : ''}
          </div>
          ${slide.passi && Array.isArray(slide.passi) ? `
            <div class="laboratorio-passi-list">
              ${slide.passi.map((p, idx) => `
                <div class="laboratorio-passo-item stagger-item" style="--stagger-index: ${idx + 1}">
                  <span class="laboratorio-passo-num">Passo ${idx + 1}</span>
                  <span class="checklist-text">${p}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${(hasExample || hasPrompt) ? `
            <div class="laboratorio-doc-card laboratorio-preview-card stagger-item" style="--stagger-index: 5">
              <div class="lab-doc-header">
                <div class="lab-doc-header-left">
                  <span class="lab-doc-label">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lab-doc-icon">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span class="lab-doc-title-text">${hasExample ? 'Documento operativo · Esempio e Template' : 'Template operativo'}</span>
                  </span>
                  <span class="lab-doc-view-mode" id="lab-doc-view-mode">Anteprima</span>
                </div>
                <div class="lab-doc-actions">
                  <button type="button" class="dock-btn lab-icon-btn active" id="btn-lab-toggle-preview" data-tooltip="Alterna anteprima / sorgente Markdown" aria-label="Alterna anteprima formattata o sorgente Markdown" aria-pressed="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  ${templateContent ? `
                    <button type="button" class="dock-btn lab-icon-btn" id="btn-lab-copy-template" data-tooltip="Copia template Markdown" aria-label="Copia template Markdown">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  ` : ''}
                  ${hasExample ? `
                    <button type="button" class="dock-btn lab-icon-btn" id="btn-lab-copy-example" data-tooltip="Copia esempio didattico" aria-label="Copia esempio didattico">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </button>
                  ` : ''}
                </div>
              </div>

              <div class="markdown-preview-scroll-area" id="markdown-preview-pane">
                <div class="markdown-preview-body">
                  ${renderedPreview}
                </div>
              </div>
              <div class="markdown-source-pane hidden" id="markdown-source-pane">
                <pre class="laboratorio-source-code" id="laboratorio-prompt-text">${escapeHtml(templateContent)}</pre>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      labHtml = `
        <div class="lab-box">
          <span class="lab-phase-tag">Attività guidata in aula</span>
          ${this.cleanLegacyHtml(slide.contenuto || '')}
        </div>
      `;
    }
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${lead ? `<p class="slide-lead">${lead}</p>` : ''}
      ${labHtml}
    `;
  }
  renderLab(slide) { return this.renderLaboratorio(slide); }

  renderEnunciato(slide) {
    const badge = slide.badge || "";
    const stmt = slide.affermazione || slide.titolo;
    const nota = slide.nota || slide.lead || "";
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      <div class="statement-box stagger-item" style="--stagger-index: 0">
        <div class="statement-text">&ldquo;${stmt}&rdquo;</div>
        ${nota ? `<p class="statement-note">${nota}</p>` : ''}
      </div>
    `;
  }
  renderStatement(slide) { return this.renderEnunciato(slide); }

  renderQuote(slide) { return this.renderCitazione(slide); }
  renderCitazione(slide) {
    const badge = slide.badge || "";
    const quote = slide.citazione || slide.titolo;
    const autore = slide.autore || "";
    const commento = slide.commento || slide.lead || "";
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      <div class="quote-box stagger-item" style="--stagger-index: 0">
        <div class="quote-mark">&ldquo;</div>
        <blockquote class="quote-text">${quote}</blockquote>
        ${autore ? `<div class="quote-author">Fonte: ${autore}</div>` : ''}
        ${commento ? `<div class="quote-comment">${commento}</div>` : ''}
      </div>
    `;
  }

  renderWarn(slide) { return this.renderAttenzione(slide); }
  renderAttenzione(slide) {
    const badge = slide.badge || "";
    const avviso = slide.avviso || slide.lead || slide.titolo;
    const dettagli = slide.dettagli || "";
    const isSectionLayout = slide.layout === 'sezione' || slide.variante === 'sezione' || slide.stile === 'sezione';

    if (isSectionLayout) {
      return `
        <div class="section-layout-container attention-section-layout">
          ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
          <div class="section-hero-row">
            <div class="section-divider-line warn-divider-line"></div>
          </div>
          <h2 class="section-title">${slide.titolo}</h2>
          <div class="warn-lead-container stagger-item" style="--stagger-index: 0">
            <span class="warn-icon" aria-hidden="true">&#9888;</span>
            <p class="slide-lead section-lead warn-lead">${avviso}</p>
          </div>
          ${dettagli ? `
            <div class="warn-box warn-details-box stagger-item" style="--stagger-index: 1">
              <p class="warn-body">${dettagli}</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      <div class="warn-box stagger-item" style="--stagger-index: 0">
        <div class="warn-header">
          <span class="warn-icon">&#9888;</span>
          <span class="warn-title">Attenzione didattica e operativa</span>
        </div>
        <p class="warn-body"><strong>${avviso}</strong></p>
        ${dettagli ? `<p class="warn-body" style="margin-top:0.75rem;">${dettagli}</p>` : ''}
      </div>
    `;
  }

  renderGeneral(slide, tipo) {
    const badge = slide.badge || "";
    return `
      ${badge ? `<div class="slide-badge">${badge}</div>` : ''}
      <h2>${slide.titolo}</h2>
      ${this.cleanLegacyHtml(slide.contenuto || '')}
    `;
  }

  /**
   * Associa gli ascoltatori interattivi per VERIFICA, LISTA_SPUNTA, SEQUENZA, BIVIO e CONCLUSIONI
   */
  attachSlideInteractions(slide, lessonId, slideIndex) {
    const tipo = (slide.tipo || 'CONTENUTO').toUpperCase();

    if (tipo === 'VERIFICA' || tipo === 'QUIZ') {
      const options = this.slideContainer.querySelectorAll('.quiz-option:not(.locked)');
      options.forEach(opt => {
        const handler = () => {
          const optId = opt.getAttribute('data-option-id');
          this.updateSlideState(lessonId, slideIndex, { selectedId: optId, answered: true });
          this.showLesson(lessonId, slideIndex);
        };
        opt.addEventListener('click', handler);
        opt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
      });

      const btnRetry = this.slideContainer.querySelector('#btn-quiz-retry');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          this.updateSlideState(lessonId, slideIndex, { selectedId: null, answered: false });
          this.showLesson(lessonId, slideIndex);
        });
      }
    } else if (tipo === 'LISTA_SPUNTA' || tipo === 'CHECKLIST') {
      const items = this.slideContainer.querySelectorAll('.checklist-item');
      items.forEach(item => {
        const handler = () => {
          const itemId = item.getAttribute('data-item-id');
          const state = this.getSlideState(lessonId, slideIndex, { checked: {} });
          const newChecked = { ...state.checked, [itemId]: !state.checked[itemId] };
          this.updateSlideState(lessonId, slideIndex, { checked: newChecked });
          this.showLesson(lessonId, slideIndex);
        };
        item.addEventListener('click', handler);
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
      });
    } else if (tipo === 'SEQUENZA' || tipo === 'CYCLE') {
      const dots = this.slideContainer.querySelectorAll('.cycle-dot');
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          const stepIdx = parseInt(dot.getAttribute('data-cycle-step'), 10);
          this.updateSlideState(lessonId, slideIndex, { activeIndex: stepIdx });
          this.showLesson(lessonId, slideIndex);
        });
      });

      const btnPrev = this.slideContainer.querySelector('#btn-cycle-prev');
      const btnNext = this.slideContainer.querySelector('#btn-cycle-next');
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          const state = this.getSlideState(lessonId, slideIndex, { activeIndex: 0 });
          const newIdx = Math.max(0, (state.activeIndex || 0) - 1);
          this.updateSlideState(lessonId, slideIndex, { activeIndex: newIdx });
          this.showLesson(lessonId, slideIndex);
        });
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          const state = this.getSlideState(lessonId, slideIndex, { activeIndex: 0 });
          const totalSteps = (slide.step || []).length;
          const newIdx = Math.min(totalSteps - 1, (state.activeIndex || 0) + 1);
          this.updateSlideState(lessonId, slideIndex, { activeIndex: newIdx });
          this.showLesson(lessonId, slideIndex);
        });
      }
    } else if (tipo === 'BIVIO' || tipo === 'DUO') {
      const toggleBtns = this.slideContainer.querySelectorAll('.duo-toggle-btn');
      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const side = btn.getAttribute('data-duo-side');
          this.updateSlideState(lessonId, slideIndex, { activeSide: side });
          this.showLesson(lessonId, slideIndex);
        });
      });

      const cards = this.slideContainer.querySelectorAll('.duo-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const side = card.getAttribute('data-duo-target');
          this.updateSlideState(lessonId, slideIndex, { activeSide: side });
          this.showLesson(lessonId, slideIndex);
        });
      });
    } else if (tipo === 'INDICE' || tipo === 'AGENDA') {
      const rows = this.slideContainer.querySelectorAll('.indice-row[data-target-slide]');
      rows.forEach(row => {
        const targetSlide = row.getAttribute('data-target-slide');
        if (!targetSlide) return;
        const handler = () => {
          this.navigate(`#/lezione/${lessonId}/slide/${targetSlide}`);
        };
        row.addEventListener('click', handler);
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        });
      });
    } else if (tipo === 'CONCLUSIONI' || tipo === 'CLOSING') {
      const btnClosing = this.slideContainer.querySelector('#btn-closing-dashboard');
      if (btnClosing) {
        btnClosing.addEventListener('click', () => this.navigate('#dashboard'));
      }
    } else if (tipo === 'LABORATORIO' || tipo === 'LAB') {
      const templateContent = slide.templateMarkdown || slide.promptEsempio || "";
      const exampleContent = slide.esempioMarkdown || "";
      const downloadFilename = slide.downloadNome || (slide.titolo ? slide.titolo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".md" : "template.md");

      // Commutazione in-place tra anteprima formattata e sorgente Markdown
      const btnTogglePreview = this.slideContainer.querySelector('#btn-lab-toggle-preview') || this.slideContainer.querySelector('#btn-tab-preview');
      const panePreview = this.slideContainer.querySelector('#markdown-preview-pane');
      const paneSource = this.slideContainer.querySelector('#markdown-source-pane');
      const viewModeLabel = this.slideContainer.querySelector('#lab-doc-view-mode');

      if (btnTogglePreview && panePreview && paneSource) {
        btnTogglePreview.addEventListener('click', () => {
          const isCurrentlyPreview = !panePreview.classList.contains('hidden');
          if (isCurrentlyPreview) {
            panePreview.classList.add('hidden');
            paneSource.classList.remove('hidden');
            btnTogglePreview.classList.remove('active');
            btnTogglePreview.setAttribute('aria-pressed', 'false');
            btnTogglePreview.setAttribute('data-tooltip', 'Mostra anteprima formattata');
            if (viewModeLabel) viewModeLabel.textContent = 'Sorgente .md';
          } else {
            paneSource.classList.add('hidden');
            panePreview.classList.remove('hidden');
            btnTogglePreview.classList.add('active');
            btnTogglePreview.setAttribute('aria-pressed', 'true');
            btnTogglePreview.setAttribute('data-tooltip', 'Mostra sorgente Markdown');
            if (viewModeLabel) viewModeLabel.textContent = 'Anteprima';
          }
        });
      }

      // Funzione di utilità per copia negli appunti con feedback visivo coerente (icona spunta + tooltip)
      const checkIconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

      const attachCopyHandler = (btn, textToCopy, defaultTooltip, successTooltip) => {
        if (!btn || !textToCopy) return;
        btn.addEventListener('click', () => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).catch(() => { });
          }
          const oldHtml = btn.innerHTML;
          btn.innerHTML = checkIconSvg;
          btn.classList.add('copied');
          btn.setAttribute('data-tooltip', successTooltip);
          setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.classList.remove('copied');
            btn.setAttribute('data-tooltip', defaultTooltip);
          }, 2000);
        });
      };

      // Copia template Markdown
      const btnCopyTemplate = this.slideContainer.querySelector('#btn-lab-copy-template') || this.slideContainer.querySelector('#btn-copy-template') || this.slideContainer.querySelector('#btn-copy-prompt');
      if (btnCopyTemplate && templateContent) {
        attachCopyHandler(btnCopyTemplate, templateContent, 'Copia template Markdown', 'Copiato negli appunti!');
      }

      // Copia eventuale esempio didattico
      const btnCopyExample = this.slideContainer.querySelector('#btn-lab-copy-example') || this.slideContainer.querySelector('#btn-copy-example');
      if (btnCopyExample && exampleContent) {
        attachCopyHandler(btnCopyExample, exampleContent, 'Copia esempio didattico', 'Esempio copiato!');
      }

      // Gestione di fallback download per compatibilità
      const btnDownload = this.slideContainer.querySelector('#btn-download-template');
      if (btnDownload && templateContent) {
        btnDownload.addEventListener('click', () => {
          try {
            const blob = new Blob([templateContent], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (e) {
            console.error('Errore download template:', e);
          }
        });
      }
    }

    // Ascoltatori per ingrandimento immagini a schermo intero (Media Lightbox)
    const figures = this.slideContainer.querySelectorAll('.figura-img');
    figures.forEach((img) => {
      const openHandler = () => {
        this.openLightbox(img.src, img.alt, img);
      };
      img.addEventListener('click', openHandler);
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHandler();
        }
      });
    });
  }

  /**
   * Passa alla slide precedente
   */
  prevSlide() {
    if (this.state.currentSlideIndex > 0) {
      const prevNum = this.state.currentSlideIndex;
      this.navigate(`#/lezione/${this.state.currentLessonId}/slide/${prevNum}`);
    }
  }

  /**
   * Passa alla slide successiva
   */
  nextSlide() {
    const lesson = lezioniData.find(l => l.id === this.state.currentLessonId);
    if (lesson && this.state.currentSlideIndex < lesson.slides.length - 1) {
      const nextNum = this.state.currentSlideIndex + 2;
      this.navigate(`#/lezione/${this.state.currentLessonId}/slide/${nextNum}`);
    }
  }

  /**
   * Individua l'indice della slide di tipo INDICE all'interno della lezione specificata
   */
  findIndiceSlideIndex(lesson) {
    if (!lesson || !lesson.slides) return -1;
    return lesson.slides.findIndex(s => {
      const t = (s.tipo || '').toUpperCase();
      return t === 'INDICE' || t === 'AGENDA';
    });
  }

  /**
   * Salta direttamente alla slide di tipo INDICE della lezione corrente
   */
  goToIndice() {
    if (this.state.currentLessonId === null) return;
    const lesson = lezioniData.find(l => l.id === this.state.currentLessonId);
    if (!lesson) return;

    const indiceIdx = this.findIndiceSlideIndex(lesson);

    if (indiceIdx !== -1 && indiceIdx !== this.state.currentSlideIndex) {
      this.navigate(`#/lezione/${lesson.id}/slide/${indiceIdx + 1}`);
    }
  }

  /**
   * Gestione finestra approfondimenti
   */
  openNotes() {
    this.updateNotesContent();
    this.notesModal.classList.remove('hidden');
    this.state.isNotesOpen = true;
  }

  closeNotes() {
    this.notesModal.classList.add('hidden');
    this.state.isNotesOpen = false;
  }

  /**
   * Gestione Media Lightbox (visore figure a schermo intero)
   */
  openLightbox(src, alt = '', triggerEl = null) {
    if (!this.mediaLightbox || !this.lightboxImg) return;
    this.state.isLightboxOpen = true;
    this.state.lightboxTriggerEl = triggerEl || document.activeElement;
    this.lightboxImg.src = src;
    this.lightboxImg.alt = alt || 'Figura a schermo intero';
    this.mediaLightbox.classList.remove('hidden');
    if (this.btnCloseLightbox) {
      this.btnCloseLightbox.focus();
    }
  }

  closeLightbox() {
    if (!this.mediaLightbox) return;
    this.state.isLightboxOpen = false;
    this.mediaLightbox.classList.add('hidden');
    if (this.lightboxImg) {
      this.lightboxImg.src = '';
    }
    if (this.state.lightboxTriggerEl && typeof this.state.lightboxTriggerEl.focus === 'function') {
      this.state.lightboxTriggerEl.focus();
    }
  }

  updateNotesContent() {
    const lesson = lezioniData.find(l => l.id === this.state.currentLessonId);
    if (!lesson) return;

    const currentSlide = lesson.slides[this.state.currentSlideIndex];
    if (currentSlide && currentSlide.approfondimento) {
      this.notesModalContent.innerHTML = `
        <div class="slide-badge">Slide ${this.state.currentSlideIndex + 1}: ${currentSlide.titolo}</div>
        ${currentSlide.approfondimento}
      `;
    } else {
      this.notesModalContent.innerHTML = '<p>Nessuna nota aggiuntiva disponibile per questa slide.</p>';
    }
  }

  /**
   * Gestione della Panoramica Slide
   */
  openOverview() {
    const lesson = lezioniData.find(l => l.id === this.state.currentLessonId);
    if (!lesson) return;

    this.overviewGrid.innerHTML = '';
    lesson.slides.forEach((slide, idx) => {
      const item = document.createElement('div');
      item.className = `overview-item ${idx === this.state.currentSlideIndex ? 'current-slide' : ''}`;
      const tipo = (slide.tipo || 'CONTENT').toUpperCase();
      item.innerHTML = `
        <div class="overview-item-header">
          <span class="overview-num">Slide ${idx + 1}</span>
          <span class="overview-type-badge">${tipo}</span>
        </div>
        <h4 class="overview-title">${slide.titolo}</h4>
      `;
      item.addEventListener('click', () => {
        this.closeOverview();
        this.navigate(`#/lezione/${lesson.id}/slide/${idx + 1}`);
      });
      this.overviewGrid.appendChild(item);
    });

    this.overviewModal.classList.remove('hidden');
    this.state.isOverviewOpen = true;
  }

  closeOverview() {
    this.overviewModal.classList.add('hidden');
    this.state.isOverviewOpen = false;
  }

  updateOverviewActiveState() {
    const items = this.overviewGrid.querySelectorAll('.overview-item');
    items.forEach((item, idx) => {
      if (idx === this.state.currentSlideIndex) {
        item.classList.add('current-slide');
      } else {
        item.classList.remove('current-slide');
      }
    });
  }

  /**
   * Gestione finestra scorciatoie da tastiera
   */
  openShortcuts() {
    this.shortcutsModal.classList.remove('hidden');
    this.state.isShortcutsOpen = true;
  }

  closeShortcuts() {
    this.shortcutsModal.classList.add('hidden');
    this.state.isShortcutsOpen = false;
  }

  /**
   * Prepara il layout di stampa sequenziale con tutte le slide della lezione attiva
   */
  printLesson() {
    const lesson = lezioniData.find(l => l.id === this.state.currentLessonId);
    if (!lesson || !lesson.slides) return;

    this.closeNotes();
    this.closeOverview();
    this.closeShortcuts();

    this.printContainer.innerHTML = '';

    lesson.slides.forEach((slide, idx) => {
      const page = document.createElement('section');
      page.className = 'print-slide';
      const tipo = (slide.tipo || 'CONTENUTO').toUpperCase();

      let bodyHtml = '';
      if ((tipo === 'VERIFICA' || tipo === 'QUIZ') && slide.opzioni) {
        bodyHtml = `
          ${slide.badge ? `<div class="slide-badge">${slide.badge}</div>` : ''}
          <h2>${slide.titolo}</h2>
          <div class="quiz-container">
            <div class="quiz-question-box">
              <p class="quiz-question-text">${slide.domanda || slide.titolo}</p>
            </div>
            <div class="quiz-options-grid">
              ${slide.opzioni.map(opt => `
                <div class="quiz-option ${opt.corretta ? 'correct' : ''}">
                  <span class="quiz-option-letter">${opt.id}</span>
                  <span class="quiz-option-text">${opt.testo} ${opt.corretta ? '<strong>(Risposta corretta)</strong>' : ''}</span>
                </div>
              `).join('')}
            </div>
            ${slide.spiegazione ? `
              <div class="quiz-feedback status-correct">
                <div class="quiz-feedback-title">Soluzione e spiegazione didattica:</div>
                <p class="quiz-feedback-desc">${slide.spiegazione}</p>
              </div>
            ` : ''}
          </div>
        `;
      } else if ((tipo === 'SEQUENZA' || tipo === 'CYCLE') && slide.step) {
        bodyHtml = `
          ${slide.badge ? `<div class="slide-badge">${slide.badge}</div>` : ''}
          <h2>${slide.titolo}</h2>
          ${slide.lead ? `<p class="slide-lead">${slide.lead}</p>` : ''}
          <div class="card-grid" style="margin-top: 1rem;">
            ${slide.step.map(st => `
              <div class="card">
                <div class="cycle-step-pill" style="margin-bottom: 0.5rem;">Fase ${st.numero}: ${st.fase}</div>
                <p>${st.descrizione}</p>
                ${st.ruolo ? `<small style="color: var(--accent-cta); display: block; margin-top: 0.5rem;">${st.ruolo}</small>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      } else if ((tipo === 'LISTA_SPUNTA' || tipo === 'CHECKLIST') && slide.elementi) {
        bodyHtml = `
          ${slide.badge ? `<div class="slide-badge">${slide.badge}</div>` : ''}
          <h2>${slide.titolo}</h2>
          ${slide.lead ? `<p class="slide-lead">${slide.lead}</p>` : ''}
          <div class="checklist-items-list" style="margin-top: 1rem;">
            ${slide.elementi.map(el => `
              <div class="checklist-item">
                <div class="checklist-box">[ ]</div>
                <span class="checklist-text">${el.testo}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if ((tipo === 'BIVIO' || tipo === 'DUO') && (slide.opzioneA || slide.opzioneB)) {
        const opA = slide.opzioneA || {};
        const opB = slide.opzioneB || {};
        bodyHtml = `
          ${slide.badge ? `<div class="slide-badge">${slide.badge}</div>` : ''}
          <h2>${slide.titolo}</h2>
          ${slide.lead ? `<p class="slide-lead">${slide.lead}</p>` : ''}
          <div class="duo-cards-grid">
            <div class="duo-card active">
              <span class="duo-card-badge">${opA.sottotitolo || 'Opzione A'}</span>
              <h3 class="duo-card-title">${opA.etichetta || 'Opzione A'}</h3>
              ${opA.testo ? `<div class="duo-card-prompt">${opA.testo}</div>` : ''}
              ${opA.esito ? `<p class="duo-card-outcome">${opA.esito}</p>` : ''}
            </div>
            <div class="duo-card active">
              <span class="duo-card-badge">${opB.sottotitolo || 'Opzione B'}</span>
              <h3 class="duo-card-title">${opB.etichetta || 'Opzione B'}</h3>
              ${opB.testo ? `<div class="duo-card-prompt">${opB.testo}</div>` : ''}
              ${opB.esito ? `<p class="duo-card-outcome">${opB.esito}</p>` : ''}
            </div>
          </div>
        `;
      } else {
        bodyHtml = this.renderSlideContent(slide, lesson.id, idx);
      }

      page.innerHTML = `
        <header class="print-slide-header">
          Lezione ${lesson.id}: ${lesson.titolo} &bull; [${tipo}] &bull; Pagina ${idx + 1} di ${lesson.slides.length}
        </header>
        <div class="print-slide-body">
          ${bodyHtml}
        </div>
      `;
      this.printContainer.appendChild(page);
    });

    // Concediamo al motore del browser il tempo di reflow e calcolo layout
    const cleanupPrint = () => {
      this.printContainer.innerHTML = '';
      window.removeEventListener('afterprint', cleanupPrint);
    };
    window.addEventListener('afterprint', cleanupPrint);

    setTimeout(() => {
      window.print();
    }, 150);
  }

  /**
   * Gestisce le scorciatoie da tastiera
   */
  handleKeyboard(event) {
    // Tasto ? per mostrare/nascondere le scorciatoie in qualunque vista
    if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
      event.preventDefault();
      if (this.state.isShortcutsOpen) {
        this.closeShortcuts();
      } else {
        this.openShortcuts();
      }
      return;
    }

    // Tasto T per alternare ciclicamente il tema visivo
    if ((event.key === 't' || event.key === 'T') && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const tag = event.target && event.target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        event.preventDefault();
        this.cycleTheme();
        return;
      }
    }

    // Gestione chiusura finestre con Esc
    if (event.key === 'Escape') {
      if (this.state.isLightboxOpen) {
        this.closeLightbox();
        return;
      }
      if (this.state.isShortcutsOpen) {
        this.closeShortcuts();
        return;
      }
      if (this.state.isNotesOpen) {
        this.closeNotes();
        return;
      }
      if (this.state.isOverviewOpen) {
        this.closeOverview();
        return;
      }
      // Se nessuna modale e aperta e siamo in una lezione, Esc torna alla dashboard
      if (this.state.currentLessonId !== null) {
        this.navigate('#dashboard');
        return;
      }
    }

    // Se una modale e aperta, blocca i comandi di navigazione slide
    if (this.state.isNotesOpen || this.state.isOverviewOpen || this.state.isShortcutsOpen || this.state.isLightboxOpen) return;

    // Tasto D per tornare alla dashboard
    if (event.key === 'd' || event.key === 'D') {
      if (this.state.currentLessonId !== null) {
        event.preventDefault();
        this.navigate('#dashboard');
        return;
      }
    }

    // Se ci troviamo nella dashboard, i comandi slide sottostanti non si applicano
    if (this.state.currentLessonId === null) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        this.prevSlide();
        break;

      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        this.nextSlide();
        break;

      case 'g':
      case 'G':
        event.preventDefault();
        this.openOverview();
        break;

      case 'i':
      case 'I': {
        const tag = event.target && event.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (event.target && event.target.isContentEditable)) break;
        event.preventDefault();
        this.goToIndice();
        break;
      }

      case 'n':
      case 'N':
        event.preventDefault();
        this.openNotes();
        break;

      case 'p':
      case 'P':
        if (!event.altKey) {
          event.preventDefault();
          this.printLesson();
        }
        break;

      default:
        break;
    }
  }
}

// Inizializzazione al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
  new SlideApp();
});
