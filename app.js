/* Freebuff — logique de l'interface (aucune dépendance) */
(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const ic = (n, cls) => `<svg class="i${cls ? ' ' + cls : ''}"><use href="#i-${n}"/></svg>`;

  /* ------------------------------------------------------------------ modèles
     noms repris de common/src/constants/freebuff-models.ts du dépôt Freebuff */
  const MODELS = [
    { name: 'DeepSeek V4.1 Flash', tag: 'Fast', free: true },
    { name: 'GLM 5.3 Flash', tag: 'Fast and light', free: true },
    { name: 'Gemini 3.8 Flash', tag: 'Balanced', free: true },
    { name: 'Kimi K3', tag: 'Deep reasoning' },
    { name: 'Claude Sonnet 5', tag: 'Agentic coding' },
    { name: 'Grok 4.7', tag: 'Early access' },
    { name: 'GPT 6.1 Sol', tag: 'Recommended' },
    { name: 'Luna 6', tag: 'Free', free: true },
    { name: 'Mimo 2.6 Pro', tag: 'Balanced' },
    { name: 'Muse Spark 1.3', tag: 'Early access' },
  ];
  const EFFORTS = ['Low', 'Medium', 'High'];

  /* ------------------------------------------------------------------- état */
  const store = {
    threads: [
      {
        id: 't1',
        title: 'Corriger crash RAM et le',
        blocks: [
          { t: 'notice' },
          { t: 'date', label: 'dim. 8 nov. at 19:09' },
          {
            t: 'user',
            text:
              "Clone ferelking242/watchtower ensuite tu va fix lapp bug crash calll ram nest pas rapide ni optimise cest une vrai merde trouve la cause profonde tout lapp est dunne lwntwur et calle tro soit cest trop de get mal fait reflechi a tout ca et au paralelisme et push sur mian pas de pr avec ce pat ghp_•••••••••••••••••••••••",
          },
          { t: 'worked', label: 'Worked for 15m 44s' },
          {
            t: 'text',
            text: "Je commence par provisionner l'environnement de travail, puis je clone le dépôt pour inspecter le code.",
          },
          { t: 'error' },
          { t: 'feedback' },
        ],
      },
      { id: 't2', title: 'Clone vocali tu', blocks: [] },
      { id: 't3', title: 'New chat', blocks: [] },
      { id: 't4', title: 'Corrections lecteur W', blocks: [] },
      { id: 't5', title: 'Optimisation De Watc', blocks: [] },
    ],
    tabs: ['t1'],
    active: 't1',
    model: 'DeepSeek V4.1 Flash',
    effort: 'High',
    attachments: [],
    legacy: [
      { id: 'a1', title: 'Audit mémoire watct…' },
      { id: 'a2', title: 'Refactor des appels GET' },
    ],
  };

  const feed = $('#feed');
  const input = $('#input');
  const sendBtn = $('#send');
  const tabsEl = $('#tabs');
  const threadList = $('#threadList');
  const drawer = $('#drawer');
  const scrim = $('#scrim');
  const sheet = $('#sheet');
  const sheetPanel = $('#sheetPanel');
  const toastEl = $('#toast');
  const terminal = $('#terminal');
  const termOut = $('#termOut');
  const termInput = $('#termInput');

  const activeThread = () => store.threads.find((t) => t.id === store.active) || store.threads[0];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ------------------------------------------------------------------- toast */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.hidden = true), 2200);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copié');
    } catch {
      toast('Copie impossible dans ce navigateur');
    }
  }

  /* -------------------------------------------------------------------- feed */
  function emptyState() {
    const d = document.createElement('div');
    d.className = 'empty';
    d.innerHTML = `<div class="empty-logo">Freebuff</div>
      <p>Pose une question, colle une erreur ou demande un refactor.<br>Le fil s'ouvre ici.</p>`;
    return d;
  }

  function renderBlock(b, i) {
    const n = document.createElement('div');
    switch (b.t) {
      case 'notice':
        n.className = 'card notice';
        n.innerHTML = `
          <div class="notice-head">
            ${ic('code-pane')}
            <div class="notice-tools">
              <button class="raw" data-act="term" title="Terminal">${ic('list')}</button>
              <button class="raw" data-act="attach" title="Joindre une image">${ic('image')}</button>
              <button class="raw" data-act="projects" title="Projets">${ic('folder')}</button>
              <button class="raw" data-act="drawer" title="Tiroir">${ic('sidebar')}</button>
            </div>
          </div>
          <div class="notice-body">${ic('info', 'info')}<p>Cloud runner restarted. Completed steps are saved; send a message to continue.</p></div>`;
        break;
      case 'date':
        n.className = 'date';
        n.textContent = b.label;
        break;
      case 'user':
        n.className = 'user-block';
        n.innerHTML = `
          <div class="bubble"><p>${esc(b.text)}</p></div>
          <div class="actions">
            <button class="raw" data-act="edit" data-i="${i}" title="Modifier">${ic('pencil')}</button>
            <button class="raw" data-act="undo" data-i="${i}" title="Annuler ce message">${ic('undo')}</button>
            <button class="raw" data-act="copy" data-i="${i}" title="Copier">${ic('copy')}</button>
          </div>`;
        break;
      case 'worked':
        n.className = 'worked';
        n.innerHTML = `<button class="raw worked-btn">${esc(b.label)} ${ic('chev-r')}</button>`;
        n.querySelector('button').addEventListener('click', () =>
          toast('Étapes enregistrées — détail indisponible hors ligne')
        );
        break;
      case 'text':
        n.className = 'assistant';
        n.innerHTML = `<p>${esc(b.text)}</p>`;
        break;
      case 'error':
        n.className = 'card error';
        n.innerHTML = `${ic('info', 'info')}
          <p>Cloud run stopped on an unexpected error. Completed steps are saved; send a message to try again.</p>
          <button class="retry" data-act="retry" data-i="${i}">Retry</button>`;
        break;
      case 'feedback':
        n.className = 'feedback';
        n.innerHTML = `
          <button class="raw" data-act="comment" title="Commenter">${ic('bubble')}</button>
          <button class="raw thumb" data-act="up" title="Utile">${ic('thumb')}</button>
          <button class="raw thumb" data-act="down" title="Pas utile">${ic('thumb', 'down')}</button>
          <button class="raw" data-act="copy-reply" title="Copier la réponse">${ic('copy')}</button>`;
        break;
      case 'typing':
        n.className = 'typing';
        n.innerHTML = '<i></i><i></i><i></i>';
        break;
      default:
        n.className = 'assistant';
        n.textContent = '';
    }
    return n;
  }

  function renderFeed() {
    const th = activeThread();
    feed.innerHTML = '';
    if (!th.blocks.length) feed.appendChild(emptyState());
    th.blocks.forEach((b, i) => feed.appendChild(renderBlock(b, i)));
    feed.scrollTop = feed.scrollHeight;
  }

  /* --------------------------------------------------------- actions du feed */
  feed.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const i = Number(btn.dataset.i);
    const th = activeThread();

    if (act === 'copy' || act === 'copy-reply') {
      const text = act === 'copy' ? th.blocks[i].text : [...th.blocks].reverse().find((b) => b.t === 'text')?.text;
      if (text) copy(text);
      return;
    }
    if (act === 'edit') {
      input.value = th.blocks[i].text;
      resize();
      updateSend();
      input.focus();
      toast('Message chargé dans le composer');
      return;
    }
    if (act === 'undo') {
      th.blocks.splice(i, 1);
      renderFeed();
      toast('Message retiré du fil');
      return;
    }
    if (act === 'retry') {
      th.blocks[i] = { t: 'worked', label: 'Worked for 1s' };
      th.blocks.push({ t: 'text', text: "Environnement relancé. Je reprends l'inspection du dépôt." });
      renderFeed();
      toast('Nouvelle tentative lancée');
      return;
    }
    if (act === 'up' || act === 'down') {
      const group = btn.parentElement.querySelectorAll('.thumb');
      const was = btn.classList.contains('on');
      group.forEach((b) => b.classList.remove('on'));
      if (!was) btn.classList.add('on');
      toast(btn.classList.contains('on') ? 'Merci pour ce retour' : 'Retour retiré');
      return;
    }
    if (act === 'comment') {
      input.value = '';
      input.focus();
      toast('Écris ton commentaire dans le composer');
      return;
    }
    if (act === 'term') return toggleTerminal();
    if (act === 'drawer') return toggleDrawer();
    if (act === 'projects') return openDrawer('projects');
    if (act === 'attach') return $('#file').click();
  });

  /* ---------------------------------------------------------------- composer */
  function resize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 116) + 'px';
  }
  function updateSend() {
    const empty = !input.value.trim();
    sendBtn.disabled = empty;
    sendBtn.classList.toggle('idle', empty);
  }

  input.addEventListener('input', () => {
    resize();
    updateSend();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  sendBtn.addEventListener('click', send);

  const REPLIES = [
    'Environnement prêt. Je lis le dépôt, puis je reproduis le crash avant de toucher au code.',
    "J'ai listé les appels bloquants du chemin critique. Je les regroupe par pool pour paralléliser sans saturer la RAM.",
    'Correctif appliqué sur la boucle de synchronisation ; je vérifie maintenant le pic mémoire sur 5 minutes.',
  ];
  let replyIdx = 0;

  function send() {
    const raw = input.value.trim();
    if (!raw) return;

    if (raw.startsWith('/')) {
      const cmd = raw.slice(1).split(/\s+/)[0];
      input.value = '';
      resize();
      updateSend();
      if (cmd === 'clear') {
        activeThread().blocks = [];
        renderFeed();
        toast('Fil effacé');
      } else if (cmd === 'model') openModels();
      else if (cmd === 'help') openHelp();
      else if (cmd === 'plan') setMode('Plan');
      else toast(`Commande inconnue : /${cmd}`);
      return;
    }

    const th = activeThread();
    th.blocks.push({ t: 'user', text: raw });
    if (th.title === 'New chat' || !th.title) {
      th.title = raw.length > 22 ? raw.slice(0, 22) + '…' : raw;
      renderTabs();
      renderThreads();
    }
    const files = store.attachments.slice();
    if (files.length) {
      th.blocks.push({ t: 'text', text: 'Pièces jointes : ' + files.map((f) => f.name).join(', ') });
      store.attachments = [];
      renderChips();
    }
    input.value = '';
    resize();
    updateSend();
    th.blocks.push({ t: 'typing' });
    renderFeed();

    setTimeout(() => {
      const idx = th.blocks.findIndex((b) => b.t === 'typing');
      if (idx > -1) th.blocks.splice(idx, 1);
      th.blocks.push({ t: 'worked', label: 'Worked for 2s' });
      th.blocks.push({ t: 'text', text: REPLIES[replyIdx++ % REPLIES.length] });
      if (store.active === th.id) renderFeed();
    }, 1200);
  }

  /* -------------------------------------------------------------- pièces jointes */
  $('#attach').addEventListener('click', () => $('#file').click());
  $('#file').addEventListener('change', (e) => {
    for (const f of e.target.files) store.attachments.push({ name: f.name, size: f.size });
    e.target.value = '';
    renderChips();
    toast('Fichier joint');
  });

  function renderChips() {
    const chips = $('#chips');
    chips.hidden = store.attachments.length === 0;
    chips.innerHTML = '';
    store.attachments.forEach((f, i) => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.innerHTML = `${ic('paperclip')}<span>${esc(f.name)}</span>`;
      const x = document.createElement('button');
      x.className = 'raw';
      x.innerHTML = ic('x');
      x.addEventListener('click', () => {
        store.attachments.splice(i, 1);
        renderChips();
      });
      c.appendChild(x);
      chips.appendChild(c);
    });
  }

  /* ------------------------------------------------------------------- modes */
  function setMode(mode) {
    document.querySelectorAll('#modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
    if (mode === 'Skills') {
      openSkills();
      document.querySelectorAll('#modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === 'Build'));
      return;
    }
    const ph = {
      Build: 'Ask Freebuff... Use / for commands, @ for files',
      Plan: 'Décris la tâche : Freebuff en tire un plan avant de coder',
      Mission: 'Décris la mission longue à exécuter en arrière-plan',
    }[mode];
    input.placeholder = ph;
    input.focus();
  }
  document.querySelectorAll('#modes button').forEach((b) =>
    b.addEventListener('click', () => setMode(b.dataset.mode))
  );

  /* ---------------------------------------------------------- Code / Chat */
  document.querySelectorAll('#seg button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#seg button').forEach((x) => x.classList.toggle('on', x === b));
      const chat = b.dataset.mode === 'Chat';
      document.querySelector('.pane').classList.toggle('chat-mode', chat);
      toast(chat ? 'Mode Chat' : 'Mode Code');
    })
  );

  /* --------------------------------------------------------------- onglets */
  function renderTabs() {
    tabsEl.innerHTML = '';
    store.tabs.forEach((id) => {
      const th = store.threads.find((t) => t.id === id);
      if (!th) return;
      const tab = document.createElement('div');
      tab.className = 'tab' + (id === store.active ? ' on' : '');
      tab.innerHTML = `<span>${esc(th.title)}</span>`;
      tab.querySelector('span').addEventListener('click', () => activate(id));
      const x = document.createElement('button');
      x.className = 'raw';
      x.innerHTML = ic('x', 'x');
      x.title = 'Fermer';
      x.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(id);
      });
      tab.appendChild(x);
      tabsEl.appendChild(tab);
    });
  }

  function activate(id) {
    store.active = id;
    renderTabs();
    renderThreads();
    renderFeed();
  }

  function closeTab(id) {
    if (store.tabs.length === 1) {
      toast('Garde au moins un onglet ouvert');
      return;
    }
    store.tabs = store.tabs.filter((t) => t !== id);
    if (store.active === id) store.active = store.tabs[store.tabs.length - 1];
    renderTabs();
    renderFeed();
    renderThreads();
  }

  function openThread(id) {
    if (!store.tabs.includes(id)) store.tabs.push(id);
    activate(id);
  }

  function newChat() {
    const id = 't' + (Date.now() % 100000);
    store.threads.unshift({ id, title: 'New chat', blocks: [] });
    store.tabs.push(id);
    activate(id);
    closeDrawer();
    input.focus();
    toast('Nouvelle discussion');
  }

  $('#newTab').addEventListener('click', newChat);
  $('#newChat').addEventListener('click', newChat);

  /* ------------------------------------------------------------------ tiroir */
  function renderThreads() {
    threadList.innerHTML = '';
    store.threads.forEach((th) => {
      const row = document.createElement('div');
      row.className = 'thread' + (th.id === store.active ? ' active' : '');
      row.innerHTML = `${ic('bubble')}<span>${esc(th.title)}</span>${th.id === store.active ? '<i class="live"></i>' : ''}`;
      row.querySelector('span').addEventListener('click', () => {
        openThread(th.id);
        closeDrawer();
      });
      const del = document.createElement('button');
      del.className = 'raw';
      del.title = 'Supprimer';
      del.innerHTML = ic('trash', 'trash');
      del.addEventListener('click', () => {
        store.threads = store.threads.filter((t) => t.id !== th.id);
        store.tabs = store.tabs.filter((t) => t !== th.id);
        if (!store.tabs.length) {
          const id = 't' + (Date.now() % 100000);
          store.threads.unshift({ id, title: 'New chat', blocks: [] });
          store.tabs = [id];
        }
        if (store.active === th.id) store.active = store.tabs[0];
        renderThreads();
        renderTabs();
        renderFeed();
        toast('Discussion supprimée');
      });
      row.appendChild(del);
      threadList.appendChild(row);
    });
  }

  function openDrawer(scrollTo) {
    drawer.hidden = false;
    scrim.hidden = false;
    if (scrollTo === 'projects') $('#projectsSection').scrollIntoView({ block: 'start' });
  }
  function closeDrawer() {
    drawer.hidden = true;
    scrim.hidden = true;
  }
  function toggleDrawer() {
    drawer.hidden ? openDrawer() : closeDrawer();
  }
  scrim.addEventListener('click', closeDrawer);
  $('#railHome').addEventListener('click', toggleDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#railProjects').addEventListener('click', () => openDrawer('projects'));
  $('#drawerSearch').addEventListener('click', () =>
    toast(store.threads.length + ' discussions, recherche indisponible hors ligne')
  );

  /* ------------------------------------------------------------------ sheets */
  function openSheet(html) {
    sheetPanel.innerHTML = html;
    sheet.hidden = false;
    closeDrawer();
  }
  function closeSheet() {
    sheet.hidden = true;
  }
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) closeSheet();
  });
  sheetPanel.addEventListener('click', (e) => {
    const close = e.target.closest('[data-close]');
    if (close) closeSheet();
  });

  function sheetHead(title, sub) {
    return `<div class="sheet-head">
      <div><h3>${esc(title)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
      <button class="raw" data-close>${ic('x')}</button>
    </div>`;
  }

  function openModels() {
    openSheet(
      sheetHead('Modèle', 'Liste issue du dépôt Freebuff') +
        `<div class="sheet-list">${MODELS.map(
          (m) => `<button class="sheet-item${m.name === store.model ? ' on' : ''}" data-model="${esc(m.name)}">
            <span class="mi-name">${esc(m.name)}</span>
            <span class="mi-tag">${esc(m.tag)}${m.free ? ' · Free' : ''}</span>
            ${m.name === store.model ? ic('check', 'check') : ''}
          </button>`
        ).join('')}</div>
        <div class="sheet-sub">Raisonnement</div>
        <div class="efforts">${EFFORTS.map(
          (e) => `<button class="effort${e === store.effort ? ' on' : ''}" data-effort="${e}">${e}</button>`
        ).join('')}</div>`
    );
  }

  sheetPanel.addEventListener('click', (e) => {
    const m = e.target.closest('[data-model]');
    if (m) {
      store.model = m.dataset.model;
      $('#modelName').textContent = store.model;
      closeSheet();
      toast('Modèle : ' + store.model);
      return;
    }
    const ef = e.target.closest('[data-effort]');
    if (ef) {
      store.effort = ef.dataset.effort;
      $('#modelEffort').textContent = store.effort;
      sheetPanel.querySelectorAll('.effort').forEach((b) => b.classList.toggle('on', b === ef));
      return;
    }
  });

  $('#modelBtn').addEventListener('click', openModels);

  function openHours() {
    openSheet(
      sheetHead('Daily hours', 'Crédits gratuits du jour') +
        `<div class="hours">
          <div class="hours-row"><strong>3:00</strong><span>restantes sur 5:00</span></div>
          <div class="bar"><i style="width:60%"></i></div>
          <p>Réinitialisation à minuit, heure locale.</p>
        </div>
        <button class="sheet-cta" data-cta="usage">Obtenir 7× plus d'heures</button>`
    );
  }
  function openUsage() {
    openSheet(
      sheetHead('7× usage', '8 $ / mois') +
        `<ul class="bullets">
          <li>35 h d'agent par jour au lieu de 5 h</li>
          <li>Accès aux modèles Pro et à l'accès anticipé</li>
          <li>Résiliable à tout moment</li>
        </ul>
        <button class="sheet-cta" data-cta="fake-pay">Activer pour 8 $</button>`
    );
  }
  function openInvite() {
    openSheet(
      sheetHead('Invite friends', '0 / 3 invités') +
        `<p class="sheet-p">Chaque ami qui rejoint te donne 2 h d'agent supplémentaires.</p>
        <div class="invite-row"><code>freebuff.com/?ref=ferelking242</code>
        <button class="sheet-cta small" data-cta="copy-invite">Copier</button></div>`
    );
  }
  function openSkills() {
    const skills = [
      ['Audit mémoire', 'Traque les fuites et les allocations inutiles'],
      ['Parallélisme', 'Découpe les appels bloquants en pool'],
      ['Tests manquants', 'Écrit les tests des chemins critiques'],
      ['Revue de PR', 'Relit le diff et bloque les régressions'],
    ];
    openSheet(
      sheetHead('Skills', 'Ajoute une compétence au message') +
        `<div class="sheet-list">${skills
          .map(
            ([n, d]) => `<button class="sheet-item" data-skill="${esc(n)}">
              <span><span class="mi-name">${esc(n)}</span><span class="mi-tag">${esc(d)}</span></span>
              ${ic('plus')}
            </button>`
          )
          .join('')}</div>`
    );
  }
  function openHelp() {
    openSheet(
      sheetHead('Aide', 'Raccourcis et commandes') +
        `<div class="sheet-list">
          <div class="sheet-item static"><span class="mi-name">Entrée</span><span class="mi-tag">Envoyer</span></div>
          <div class="sheet-item static"><span class="mi-name">Maj + Entrée</span><span class="mi-tag">Nouvelle ligne</span></div>
          <div class="sheet-item static"><span class="mi-name">/clear</span><span class="mi-tag">Vider le fil</span></div>
          <div class="sheet-item static"><span class="mi-name">/model</span><span class="mi-tag">Changer de modèle</span></div>
          <div class="sheet-item static"><span class="mi-name">/plan</span><span class="mi-tag">Passer en mode Plan</span></div>
          <div class="sheet-item static"><span class="mi-name">Échap</span><span class="mi-tag">Fermer un panneau</span></div>
        </div>`
    );
  }
  function openSettings() {
    openSheet(
      sheetHead('Réglages') +
        `<div class="sheet-list">
          <button class="sheet-item" data-cta="clear-thread"><span class="mi-name">Effacer cette conversation</span>${ic('trash')}</button>
          <button class="sheet-item" data-cta="copy-link"><span class="mi-name">Copier le lien du fil</span>${ic('copy')}</button>
          <button class="sheet-item" data-cta="motion"><span class="mi-name">Réduire les animations</span><span class="mi-tag" id="motionState">Non</span></button>
          <button class="sheet-item" data-cta="signout"><span class="mi-name">Se déconnecter</span></button>
        </div>`
    );
  }
  function openNewProject() {
    openSheet(
      sheetHead('New project', 'Un dépôt, plusieurs discussions') +
        `<input class="sheet-input" id="projInput" placeholder="Nom du projet" />
        <button class="sheet-cta" data-cta="create-project">Créer le projet</button>`
    );
  }
  function openLegacy() {
    openSheet(
      sheetHead('Legacy', 'Discussions archivées') +
        `<div class="sheet-list">${
          store.legacy.length
            ? store.legacy
                .map(
                  (t) => `<button class="sheet-item" data-restore="${t.id}">
                    <span class="mi-name">${esc(t.title)}</span><span class="mi-tag">Restaurer</span>
                  </button>`
                )
                .join('')
            : '<p class="sheet-p">Aucune discussion archivée.</p>'
        }</div>`
    );
  }

  sheetPanel.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cta]');
    if (t) {
      const cta = t.dataset.cta;
      if (cta === 'usage') openUsage();
      else if (cta === 'fake-pay') {
        closeSheet();
        toast('Paiement désactivé dans cette maquette');
      } else if (cta === 'copy-invite') copy('https://freebuff.com/?ref=ferelking242');
      else if (cta === 'clear-thread') {
        activeThread().blocks = [];
        renderFeed();
        closeSheet();
        toast('Conversation effacée');
      } else if (cta === 'copy-link') copy(location.origin + location.pathname + '#' + store.active);
      else if (cta === 'motion') {
        const on = document.body.classList.toggle('no-anim');
        const st = doc('#motionState');
        if (st) st.textContent = on ? 'Oui' : 'Non';
      } else if (cta === 'signout') {
        closeSheet();
        toast('Maquette : aucune session à fermer');
      } else if (cta === 'create-project') {
        const v = doc('#projInput');
        if (v && v.value.trim()) {
          $('#projectName').textContent = v.value.trim();
          closeSheet();
          toast('Projet créé');
        } else toast('Donne un nom au projet');
      }
      return;
    }
    const sk = e.target.closest('[data-skill]');
    if (sk) {
      store.attachments.push({ name: 'skill:' + sk.dataset.skill.toLowerCase().replace(/\s+/g, '-') });
      renderChips();
      closeSheet();
      toast('Compétence ajoutée');
      return;
    }
    const rs = e.target.closest('[data-restore]');
    if (rs) {
      const item = store.legacy.find((t) => t.id === rs.dataset.restore);
      if (item) {
        store.threads.unshift({ id: item.id, title: item.title, blocks: [] });
        store.legacy = store.legacy.filter((t) => t.id !== item.id);
        openThread(item.id);
        closeSheet();
        toast('Discussion restaurée');
      }
    }
  });

  const doc = (s) => sheetPanel.querySelector(s);

  /* --------------------------------------------------------------- rail */
  $('#railPanels').addEventListener('click', toggleTerminal);
  $('#railSettings').addEventListener('click', openSettings);
  $('#railGift').addEventListener('click', openInvite);
  $('#railHelp').addEventListener('click', openHelp);
  $('#avatar').addEventListener('click', openSettings);
  $('#dailyHours').addEventListener('click', openHours);
  $('#hoursBadge').addEventListener('click', openHours);
  $('#getUsage').addEventListener('click', openUsage);
  $('#invite').addEventListener('click', openInvite);
  $('#legacyBtn').addEventListener('click', openLegacy);
  $('#newProject').addEventListener('click', openNewProject);
  $('#streakBtn').addEventListener('click', () => toast('1 jour de suite — reviens demain'));
  $('#projectMenu').addEventListener('click', () =>
    toast('Projet « ' + $('#projectName').textContent + ' » — options indisponibles hors ligne')
  );
  $('#projectNew').addEventListener('click', newChat);

  /* ------------------------------------------------------------- terminal */
  function toggleTerminal() {
    if (terminal.hidden) {
      terminal.hidden = false;
      if (!termOut.childElementCount) {
        termLine("Freebuff sandbox — ubuntu 24.04 · zsh", 'dim');
        termLine("Tape 'help' pour la liste des commandes.", 'dim');
        termInput.focus();
      }
    } else terminal.hidden = true;
  }
  $('#termClose').addEventListener('click', () => (terminal.hidden = true));
  $('#termNew').addEventListener('click', () => {
    termOut.innerHTML = '';
    termLine("Nouveau terminal", 'dim');
    termInput.focus();
  });
  $('#termSide').addEventListener('click', toggleDrawer);

  function termLine(text, cls) {
    const d = document.createElement('div');
    d.className = 'term-line' + (cls ? ' ' + cls : '');
    d.textContent = text;
    termOut.appendChild(d);
    termOut.scrollTop = termOut.scrollHeight;
  }

  const FILES = ['package.json', 'bun.lock', 'README.md', 'src/', 'tests/', '.github/'];
  const CMDS = {
    help: () => [
      'ls            liste les fichiers du projet',
      'pwd           répertoire courant',
      'git status    état du dépôt',
      'cat <fichier> affiche un fichier',
      'clear         vide le terminal',
      'echo <texte>  répète le texte',
    ],
    ls: () => [FILES.join('   ')],
    pwd: () => ['/workspace/watchtower'],
    whoami: () => ['freebuff'],
    date: () => [new Date().toString()],
    'git status': () => [
      'On branch main',
      'Your branch is up to date with \'origin/main\'.',
      '',
      'nothing to commit, working tree clean',
    ],
    'cat package.json': () => ['{', '  "name": "watchtower",', '  "private": true', '}'],
    'cat readme.md': () => ['# watchtower', '', 'Application de veille — corrections de performance en cours.'],
  };

  $('#termForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const cmd = termInput.value.trim();
    if (!cmd) return;
    termInput.value = '';
    termLine('$ ' + cmd, 'prompt');
    const key = cmd.toLowerCase();
    if (key === 'clear') {
      termOut.innerHTML = '';
      return;
    }
    if (key.startsWith('echo ')) {
      termLine(cmd.slice(5));
      return;
    }
    const out = CMDS[key];
    if (out) out().forEach((l) => termLine(l));
    else if (key.startsWith('cat ')) termLine(`cat: ${cmd.slice(4)}: No such file or directory`, 'err');
    else termLine(`zsh: command not found: ${cmd.split(' ')[0]}`, 'err');
  });

  /* ------------------------------------------------------------ dicter */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let listening = false;
  $('#mic').addEventListener('click', () => {
    if (!SR) {
      toast('Dictée vocale non prise en charge par ce navigateur');
      return;
    }
    if (listening && rec) {
      rec.stop();
      return;
    }
    rec = new SR();
    rec.lang = 'fr-FR';
    rec.interimResults = true;
    rec.onstart = () => {
      listening = true;
      $('#mic').classList.add('rec');
      toast('Je t\'écoute…');
    };
    rec.onresult = (ev) => {
      let txt = '';
      for (const r of ev.results) txt += r[0].transcript;
      input.value = txt;
      resize();
      updateSend();
    };
    rec.onerror = () => toast('Dictée interrompue');
    rec.onend = () => {
      listening = false;
      $('#mic').classList.remove('rec');
    };
    rec.start();
  });

  /* ------------------------------------------------------------- clavier */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!sheet.hidden) closeSheet();
      else if (!drawer.hidden) closeDrawer();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openModels();
    }
  });

  /* -------------------------------------------------------------- démarrage */
  renderTabs();
  renderThreads();
  renderFeed();
  renderChips();
  updateSend();
})();
