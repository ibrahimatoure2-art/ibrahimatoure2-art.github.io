/* ═══════════════════════════════════════════
   TROPICAL — Système de Gestion Hospitalière
   Script principal
   ═══════════════════════════════════════════ */

/* ══════════════════════════════
   NAVIGATION ENTRE PAGES
══════════════════════════════ */

/** Titres affichés dans la topbar par identifiant de page */
const PAGE_TITLES = {
  dashboard:        'Tableau de bord',
  patients:         'Patients',
  dossiers:         'Dossiers médicaux',
  consultations:    'Consultations',
  rdv:              'Rendez-vous',
  teleconsultation: 'Téléconsultation',
  urgences:         'Urgences',
  liste_attente:    "Liste d'attente",
  ordonnances:      'Ordonnances',
  examens:          "Résultats d'examens",
  medicaments:      'Médicaments',
  stock:            'Stock & Lots',
  alertes:          'Alertes stock',
  factures:         'Factures',
  paiements:        'Paiements',
  assurances:       'Assurances',
  centres:          'Centres hospitaliers',
  services:         'Services',
  medecins:         'Médecins',
  notifications:    'Notifications',
};

/**
 * Affiche la page correspondant à l'identifiant donné
 * et met à jour l'état actif de la navigation.
 *
 * @param {string}      pageId - Identifiant de la page (ex: 'dashboard')
 * @param {HTMLElement|null} navEl  - Élément nav-item cliqué (peut être null)
 */
function showPage(pageId, navEl) {
  // Masquer toutes les pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Retirer l'état actif de tous les éléments de navigation
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Afficher la page cible
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  // Activer l'élément de navigation cliqué
  if (navEl) navEl.classList.add('active');

  // Mettre à jour le titre de la topbar
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = PAGE_TITLES[pageId] || pageId;
  }
}

/* ══════════════════════════════
   GESTION DES MODALS
══════════════════════════════ */

/**
 * Ouvre le modal identifié par son id.
 * @param {string} id - Identifiant du modal
 */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

/**
 * Ferme le modal identifié par son id.
 * @param {string} id - Identifiant du modal
 */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

/**
 * Ferme un modal en cliquant sur l'overlay (fond semi-transparent).
 */
function initModalOverlayClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

/* ══════════════════════════════
   SYSTÈME D'ONGLETS (TABS)
══════════════════════════════ */

/**
 * Active l'onglet cliqué et affiche le panneau correspondant.
 * Fonctionne dans le contexte du card-body ou card parent.
 *
 * @param {HTMLElement} el      - L'onglet cliqué
 * @param {string}      panelId - L'id du panneau à afficher
 */
function switchTab(el, panelId) {
  const parent = el.closest('.card-body') || el.closest('.card');
  if (!parent) return;

  parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  el.classList.add('active');

  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

/* ══════════════════════════════
   DÉTECTEUR D'INTERACTIONS
   MÉDICAMENTEUSES
══════════════════════════════ */

/**
 * Base de données simplifiée des interactions médicamenteuses.
 * Clé : "medicament1-medicament2"
 */
const INTERACTIONS_DB = {
  'warfarine-aspirine': {
    niveau: 'critique',
    texte:  '🔴 Interaction CRITIQUE — Warfarine + Aspirine : risque hémorragique majeur. Contre-indication formelle. Ordonnance bloquée.',
    classe: 'interaction-critique',
  },
  'aspirine-warfarine': {
    niveau: 'critique',
    texte:  '🔴 Interaction CRITIQUE — Aspirine + Warfarine : risque hémorragique majeur. Contre-indication formelle. Ordonnance bloquée.',
    classe: 'interaction-critique',
  },
  'amlodipine-losartan': {
    niveau: 'modere',
    texte:  '🟡 Interaction MODÉRÉE — Amlodipine + Losartan : association antihypertensive possible. Surveiller la tension artérielle. Ajustement posologique recommandé.',
    classe: 'interaction-modere',
  },
  'losartan-amlodipine': {
    niveau: 'modere',
    texte:  '🟡 Interaction MODÉRÉE — Losartan + Amlodipine : association antihypertensive possible. Surveiller la tension artérielle.',
    classe: 'interaction-modere',
  },
};

/**
 * Vérifie l'interaction entre les deux médicaments sélectionnés
 * dans le détecteur de la page Ordonnances et affiche le résultat.
 */
function checkInteraction() {
  const drug1  = document.getElementById('drug1');
  const drug2  = document.getElementById('drug2');
  const result = document.getElementById('interaction-result');

  if (!drug1 || !drug2 || !result) return;

  const val1 = drug1.value;
  const val2 = drug2.value;

  // Pas assez de sélection ou même médicament des deux côtés
  if (!val1 || !val2 || val1 === val2) {
    result.innerHTML = '';
    return;
  }

  const key         = val1 + '-' + val2;
  const interaction = INTERACTIONS_DB[key];

  if (interaction) {
    result.innerHTML = `
      <div class="interaction-check ${interaction.classe}">
        ${interaction.texte}
      </div>`;
  } else {
    result.innerHTML = `
      <div class="interaction-check interaction-faible">
        ✅ <strong>Aucune interaction connue</strong> entre ${val1} et ${val2}. Combinaison sûre.
      </div>`;
  }
}

/**
 * Affiche la zone de résultat dans le modal Ordonnance
 * lorsqu'un médicament est sélectionné.
 */
function checkInteractionModal() {
  const box = document.getElementById('modal-interaction');
  if (box) box.style.display = 'block';
}

/* ══════════════════════════════
   MENU BURGER (RESPONSIVE)
══════════════════════════════ */

/**
 * Affiche ou masque le bouton burger selon la largeur de l'écran,
 * et initialise le comportement du sidebar mobile.
 */
function handleResponsive() {
  const menuBtn = document.getElementById('menu-btn');
  if (!menuBtn) return;

  if (window.innerWidth <= 900) {
    menuBtn.style.display = 'flex';
  } else {
    menuBtn.style.display = 'none';
    // Refermer le sidebar mobile si l'écran s'élargit
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

/* ══════════════════════════════
   INITIALISATION
══════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Fermeture des modals via overlay
  initModalOverlayClose();

  // Gestion responsive initiale + écouteur resize
  handleResponsive();
  window.addEventListener('resize', handleResponsive);
});
