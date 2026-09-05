'use strict';

/* The design library gallery frontend.
   Fetches /api/index once, renders a Gallery view and an Ontology view.
   Vanilla, no dependencies. */

(function () {
  var DATA = null;
  var VIEW = 'gallery';
  var FILTER = { text: '', group: 'all', register: 'all', ont: null };
  var TEXT_CACHE = {}; // fileUrl -> Promise<string>
  var loadObs = null;
  var unloadObs = null;
  var lastFocus = null;

  var REGISTER_ORDER = ['minimal', 'glass', 'tactile', 'shader'];

  // Display order for the group filter: component families first, then the
  // effect themes, then the remaining categories. Groups not listed here sort
  // after, alphabetically.
  var GROUP_ORDER = [
    'Actions', 'Inputs', 'Selection', 'Navigation', 'Surfaces', 'Feedback',
    'Components',
    'Glass and material', 'Orbs and spheres', 'Fields, particles and flow',
    'Buttons and CTAs', 'Typography and text', 'Scenes and landscapes',
    'Loaders and UI chrome', 'Effects',
    'AI-native', 'AI-native primitives',
    'Scandinavian demos', 'Scandinavian scripts', 'Scandinavian site',
    'Transitions', 'Aceternity', 'Apple', 'Docs'
  ];

  // Chip element registries so counts and active state update without a rebuild.
  var GROUP_CHIPS = {};      // group id -> { btn, count }
  var REGISTER_CHIPS = {};   // register id -> { btn, count }

  // ---- small helpers ----------------------------------------------------

  function $(id) { return document.getElementById(id); }
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function humanSize(bytes) {
    if (bytes == null || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    var kb = bytes / 1024;
    if (kb < 1024) return (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  }

  function announce(msg) {
    var live = $('live');
    if (live) { live.textContent = ''; live.textContent = msg; }
  }

  function fetchText(url) {
    if (!TEXT_CACHE[url]) {
      TEXT_CACHE[url] = fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      });
    }
    return TEXT_CACHE[url];
  }

  function copy(text, onDone) {
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onDone(true);
      } catch (e) { onDone(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { onDone(true); }, fallback);
    } else {
      fallback();
    }
  }

  // ---- theme ------------------------------------------------------------

  function readStoredTheme() {
    try { return localStorage.getItem('gallery-theme') || 'auto'; }
    catch (e) { return 'auto'; }
  }
  function storeTheme(v) {
    try { localStorage.setItem('gallery-theme', v); } catch (e) {}
  }
  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    var label = $('theme-label');
    var btn = $('theme-toggle');
    var text = mode === 'auto' ? 'Auto' : (mode === 'light' ? 'Light' : 'Dark');
    if (label) label.textContent = text;
    if (btn) btn.setAttribute('aria-label', 'Theme: ' + text + '. Select to change.');
  }
  function initTheme() {
    var mode = readStoredTheme();
    try {
      var q = new URLSearchParams(location.search).get('theme');
      if (q === 'light' || q === 'dark' || q === 'auto') { mode = q; storeTheme(q); }
    } catch (e) {}
    applyTheme(mode);
    $('theme-toggle').addEventListener('click', function () {
      var cur = readStoredTheme();
      var next = cur === 'auto' ? 'light' : (cur === 'light' ? 'dark' : 'auto');
      storeTheme(next);
      applyTheme(next);
    });
  }

  // ---- data load --------------------------------------------------------

  function fetchIndex() {
    // Prefer the live local server; on any failure (offline, or a static
    // GitHub Pages host with no server) fall back to the pre-built index.json
    // sitting next to this page.
    return fetch('/api/index')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function () {
        return fetch('index.json').then(function (r) {
          if (!r.ok) throw new Error('The index request failed (HTTP ' + r.status + ').');
          return r.json();
        });
      });
  }

  function load() {
    fetchIndex()
      .then(function (data) {
        DATA = data;
        DATA.items = DATA.items || [];
        buildGroupFilters();
        buildRegisterFilters();
        buildLegend();
        renderOntology();
        applyFilters();
        setView('gallery');
      })
      .catch(showError);
  }

  function showError(err) {
    var box = $('error');
    box.hidden = false;
    box.innerHTML = '';
    var card = el('div', 'notice-card');
    var h = el('h2'); h.textContent = 'The library could not be read';
    var p = el('p');
    p.textContent = 'The gallery asks the local server for its index and did not get one. '
      + 'Make sure serve.py is running, then try again. (' + (err && err.message ? err.message : err) + ')';
    var b = el('button'); b.type = 'button'; b.textContent = 'Try again';
    b.addEventListener('click', function () { box.hidden = true; load(); });
    card.appendChild(h); card.appendChild(p); card.appendChild(b);
    box.appendChild(card);
  }

  // ---- group and register filters ---------------------------------------

  function orderedGroups() {
    var present = {};
    DATA.items.forEach(function (it) { present[it.group || 'Other'] = true; });
    return Object.keys(present).sort(function (a, b) {
      var ia = GROUP_ORDER.indexOf(a), ib = GROUP_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  function presentRegisters() {
    var present = {};
    DATA.items.forEach(function (it) {
      var r = it.meta && it.meta.register;
      if (r) present[r] = true;
    });
    return REGISTER_ORDER.filter(function (r) { return present[r]; });
  }

  function makeChip(wrap, id, label, onPick, registry) {
    var b = el('button', 'chip');
    b.type = 'button';
    b.dataset.val = id;
    var text = document.createElement('span');
    text.textContent = label;
    var count = el('span', 'chip-count');
    b.appendChild(text);
    b.appendChild(count);
    b.addEventListener('click', function () { onPick(id); });
    wrap.appendChild(b);
    registry[id] = { btn: b, count: count };
  }

  function buildGroupFilters() {
    var wrap = $('group-filters');
    wrap.innerHTML = '';
    GROUP_CHIPS = {};
    makeChip(wrap, 'all', 'All', pickGroup, GROUP_CHIPS);
    orderedGroups().forEach(function (g) {
      makeChip(wrap, g, g, pickGroup, GROUP_CHIPS);
    });
  }

  function buildRegisterFilters() {
    var wrap = $('register-filters');
    wrap.innerHTML = '';
    REGISTER_CHIPS = {};
    var regs = presentRegisters();
    if (!regs.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    makeChip(wrap, 'all', 'All registers', pickRegister, REGISTER_CHIPS);
    regs.forEach(function (r) {
      makeChip(wrap, r, cap(r), pickRegister, REGISTER_CHIPS);
    });
  }

  function pickGroup(id) {
    FILTER.group = id;
    FILTER.ont = null;
    applyFilters();
  }

  function pickRegister(id) {
    FILTER.register = id;
    FILTER.ont = null;
    applyFilters();
  }

  // ---- filtering --------------------------------------------------------

  function itemHaystack(it) {
    var m = it.meta || {};
    return [it.name, it.title, it.category, it.group, it.subgroup, m.register, m.type, m.family]
      .filter(Boolean).join(' ').toLowerCase();
  }

  function passText(it) {
    return !FILTER.text || itemHaystack(it).indexOf(FILTER.text) !== -1;
  }
  function passGroup(it) {
    return FILTER.group === 'all' || it.group === FILTER.group;
  }
  function passRegister(it) {
    if (FILTER.register === 'all') return true;
    return !!(it.meta && it.meta.register === FILTER.register);
  }

  function matches(it) {
    if (FILTER.ont) {
      var m = it.meta || {};
      if (m.family !== FILTER.ont.family || m.type !== FILTER.ont.type || m.register !== FILTER.ont.register) {
        return false;
      }
      return passText(it);
    }
    return passText(it) && passGroup(it) && passRegister(it);
  }

  function updateChip(entry, id, active, count) {
    if (!entry) return;
    entry.btn.classList.toggle('is-active', active);
    entry.btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    entry.count.textContent = count;
    entry.btn.classList.toggle('is-empty', count === 0 && id !== 'all');
  }

  function updateCounts() {
    // Counts are live to the other filters: a group's count reflects the
    // current search and register; a register's count reflects search and group.
    var groupBase = DATA.items.filter(function (it) { return passText(it) && passRegister(it); });
    var groupCounts = {};
    groupBase.forEach(function (it) { groupCounts[it.group] = (groupCounts[it.group] || 0) + 1; });
    Object.keys(GROUP_CHIPS).forEach(function (id) {
      var count = id === 'all' ? groupBase.length : (groupCounts[id] || 0);
      updateChip(GROUP_CHIPS[id], id, FILTER.group === id && !FILTER.ont, count);
    });

    var regBase = DATA.items.filter(function (it) { return passText(it) && passGroup(it); });
    var regCounts = {};
    regBase.forEach(function (it) {
      var r = it.meta && it.meta.register;
      if (r) regCounts[r] = (regCounts[r] || 0) + 1;
    });
    Object.keys(REGISTER_CHIPS).forEach(function (id) {
      var count = id === 'all' ? regBase.length : (regCounts[id] || 0);
      updateChip(REGISTER_CHIPS[id], id, FILTER.register === id && !FILTER.ont, count);
    });
  }

  function applyFilters() {
    var items = DATA.items.filter(matches);
    updateCounts();
    renderActiveFilter();
    renderGrid(items);
    var total = DATA.items.length;
    $('result-count').textContent = items.length === total
      ? total + ' items'
      : items.length + ' of ' + total + ' items';
    $('empty').hidden = items.length !== 0;
  }

  function renderActiveFilter() {
    var bar = $('active-filter');
    if (FILTER.ont) {
      var o = FILTER.ont;
      $('active-filter-text').textContent =
        'Showing ' + o.family + ' · ' + o.type + ' · ' + o.register + ' from the ontology.';
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }

  // ---- grid -------------------------------------------------------------

  function metaLine(it) {
    var parts = [it.group || labelFor(it.category)];
    var m = it.meta;
    if (m) {
      if (m.register) parts.push(cap(m.register));
      if (m.type) parts.push(m.type);
    } else if (it.subgroup) {
      parts.push(it.subgroup);
    }
    return parts.join(' · '); // thin-space middle dot
  }

  function labelFor(catId) {
    var found = (DATA.categories || []).filter(function (c) { return c.id === catId; })[0];
    return found ? found.label : cap(catId);
  }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  function renderGrid(items) {
    var grid = $('grid');
    if (loadObs) loadObs.disconnect();
    if (unloadObs) unloadObs.disconnect();
    grid.innerHTML = '';

    var frag = document.createDocumentFragment();
    if (FILTER.group === 'all' && !FILTER.ont) {
      // Show every group under its own plain heading, in the canonical order.
      var byGroup = {};
      items.forEach(function (it) {
        var g = it.group || 'Other';
        (byGroup[g] || (byGroup[g] = [])).push(it);
      });
      orderedGroups().forEach(function (g) {
        var list = byGroup[g];
        if (!list || !list.length) return;
        frag.appendChild(groupHeading(g, list.length));
        list.forEach(function (it) { frag.appendChild(makeCard(it)); });
      });
    } else {
      items.forEach(function (it) { frag.appendChild(makeCard(it)); });
    }
    grid.appendChild(frag);

    setupObservers();
  }

  function groupHeading(group, count) {
    var head = el('div', 'group-heading');
    var h = el('h2', 'group-heading-text');
    h.textContent = group;
    var c = el('span', 'group-heading-count');
    c.textContent = count;
    head.appendChild(h);
    head.appendChild(c);
    return head;
  }

  function makeCard(it) {
    var card = el('article', 'card');

    var preview = el('div', 'preview');
    var open = el('button', 'preview-open');
    open.type = 'button';
    open.setAttribute('aria-label', 'Open ' + it.title);
    open.addEventListener('click', function () { openDetail(it); });

    if (it.renderable && it.kind === 'html') {
      var ph = el('div', 'placeholder');
      ph.textContent = 'Preview';
      var frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('scrolling', 'no');
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('title', it.title + ' preview');
      frame.dataset.src = it.fileUrl;
      frame.addEventListener('load', function () {
        if (frame.src && frame.src !== 'about:blank') ph.classList.add('is-hidden');
      });
      preview.appendChild(ph);
      preview.appendChild(frame);
    } else {
      var peek = el('pre', 'peek');
      peek.textContent = kindWord(it) + '\n';
      fetchText(it.fileUrl).then(function (txt) {
        var lines = txt.split(/\r?\n/).slice(0, 20).join('\n');
        peek.textContent = lines;
      }, function () {
        peek.textContent = kindWord(it) + '\n(could not read file)';
      });
      preview.appendChild(peek);
    }
    preview.appendChild(open);
    card.appendChild(preview);

    var body = el('div', 'card-body');

    var h = el('h3', 'card-title');
    var tOpen = el('button', 'title-open');
    tOpen.type = 'button';
    tOpen.textContent = it.title;
    tOpen.addEventListener('click', function () { openDetail(it); });
    h.appendChild(tOpen);
    body.appendChild(h);

    var meta = el('p', 'card-meta');
    meta.textContent = metaLine(it);
    body.appendChild(meta);

    var foot = el('div', 'card-foot');
    var size = el('span', 'size');
    size.textContent = humanSize(it.size);
    foot.appendChild(size);

    var path = el('button', 'path');
    path.type = 'button';
    path.textContent = it.relpath;
    path.title = 'Copy path';
    path.setAttribute('aria-label', 'Copy path ' + it.relpath);
    path.addEventListener('click', function (e) {
      e.stopPropagation();
      copy(it.relpath, function (ok) {
        if (ok) {
          var prev = path.textContent;
          path.classList.add('copied');
          path.textContent = 'Copied';
          announce('Copied ' + it.relpath);
          setTimeout(function () { path.textContent = prev; path.classList.remove('copied'); }, 1100);
        } else {
          announce('Could not copy');
        }
      });
    });
    foot.appendChild(path);

    body.appendChild(foot);
    card.appendChild(body);
    return card;
  }

  function kindWord(it) {
    if (it.kind === 'tsx') return 'TSX component';
    if (it.kind === 'swift') return 'Swift' + (it.subgroup ? ' · ' + it.subgroup : '');
    if (it.kind === 'md') return 'Markdown';
    return it.kind || 'file';
  }

  // ---- lazy iframe load / unload ----------------------------------------

  function setupObservers() {
    if (loadObs) loadObs.disconnect();
    if (unloadObs) unloadObs.disconnect();
    var frames = document.querySelectorAll('#grid iframe[data-src]');
    if (!frames.length) return;

    if (!('IntersectionObserver' in window)) {
      // Degrade: load everything once. Rare on target browsers.
      Array.prototype.forEach.call(frames, function (f) {
        if (!f.src || f.src === 'about:blank') f.src = f.dataset.src;
      });
      return;
    }

    loadObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var f = e.target;
          if (!f.src || f.src === 'about:blank') f.src = f.dataset.src;
        }
      });
    }, { rootMargin: '500px 0px' });

    unloadObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) {
          var f = e.target;
          if (f.src && f.src !== 'about:blank') {
            f.src = 'about:blank';
            var ph = f.parentNode.querySelector('.placeholder');
            if (ph) ph.classList.remove('is-hidden');
          }
        }
      });
    }, { rootMargin: '1600px 0px' });

    Array.prototype.forEach.call(frames, function (f) {
      loadObs.observe(f);
      unloadObs.observe(f);
    });
  }

  // ---- detail panel -----------------------------------------------------

  function openDetail(it) {
    var panel = $('detail');
    lastFocus = document.activeElement;
    $('detail-title').textContent = it.title;
    $('detail-sub').textContent = metaLine(it);

    var bodyEl = $('detail-body');
    bodyEl.innerHTML = '';

    if (it.renderable && it.kind === 'html') {
      var stage = el('div', 'detail-stage');
      var frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-scripts allow-pointer-lock');
      frame.setAttribute('title', it.title);
      frame.src = it.fileUrl;
      stage.appendChild(frame);
      bodyEl.appendChild(stage);
    } else {
      var pre = el('pre', 'detail-code');
      pre.textContent = 'Loading ' + it.relpath + ' ...';
      fetchText(it.fileUrl).then(function (txt) {
        pre.textContent = txt;
      }, function () {
        pre.textContent = 'Could not read ' + it.relpath;
      });
      bodyEl.appendChild(pre);
    }

    bodyEl.appendChild(buildFacts(it));
    bodyEl.appendChild(buildActions(it));

    panel.hidden = false;
    document.body.style.overflow = 'hidden';
    $('detail-close').focus();
  }

  function buildFacts(it) {
    var dl = el('dl', 'detail-facts');
    function fact(label, value, mono) {
      var d = el('div', 'fact');
      var dt = el('dt'); dt.textContent = label;
      var dd = el('dd'); dd.textContent = value; if (mono) dd.className = 'mono';
      d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    }
    if (it.group) fact('Group', it.group);
    fact('Category', labelFor(it.category));
    if (it.subgroup) fact('Subgroup', it.subgroup);
    fact('Kind', it.kind);
    if (it.meta) {
      if (it.meta.family) fact('Family', it.meta.family);
      if (it.meta.type) fact('Type', it.meta.type);
      if (it.meta.register) fact('Register', cap(it.meta.register));
      if (it.meta.status) fact('Status', it.meta.status);
    }
    if (it.size != null) fact('Size', humanSize(it.size));
    fact('Path', it.relpath, true);
    return dl;
  }

  function buildActions(it) {
    var wrap = el('div', 'detail-actions');
    var openTab = el('a');
    openTab.href = it.fileUrl;
    openTab.target = '_blank';
    openTab.rel = 'noopener';
    openTab.textContent = it.renderable ? 'Open full page' : 'Open raw file';
    wrap.appendChild(openTab);

    var copyBtn = el('button');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy path';
    copyBtn.addEventListener('click', function () {
      copy(it.relpath, function (ok) {
        copyBtn.textContent = ok ? 'Copied' : 'Copy failed';
        announce(ok ? 'Copied ' + it.relpath : 'Could not copy');
        setTimeout(function () { copyBtn.textContent = 'Copy path'; }, 1100);
      });
    });
    wrap.appendChild(copyBtn);
    return wrap;
  }

  function closeDetail() {
    var panel = $('detail');
    if (panel.hidden) return;
    panel.hidden = true;
    $('detail-body').innerHTML = ''; // tears down the iframe / frees WebGL
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function initDetail() {
    $('detail-close').addEventListener('click', closeDetail);
    $('detail-backdrop').addEventListener('click', closeDetail);
    document.addEventListener('keydown', function (e) {
      var panel = $('detail');
      if (panel.hidden) return;
      if (e.key === 'Escape') { closeDetail(); return; }
      if (e.key === 'Tab') { trapTab(e, panel); }
    });
  }

  function trapTab(e, container) {
    var focusables = container.querySelectorAll(
      'a[href], button:not([disabled]), input, iframe, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ---- ontology ---------------------------------------------------------

  var STATUS_LABELS = {
    exemplar: 'Exemplar, a purpose-built reference',
    example: 'Example, a verified file',
    synth: 'Synth, generate on demand',
    'n/a': 'Not a meaningful combination'
  };

  function statusClass(status) {
    if (status === 'exemplar') return 's-exemplar';
    if (status === 'example') return 's-example';
    if (status === 'synth') return 's-synth';
    return 's-na';
  }

  function buildLegend() {
    var ul = $('legend');
    ul.innerHTML = '';
    [['exemplar', 'Exemplar'], ['example', 'Example'], ['synth', 'Synth'], ['n/a', 'Not applicable']]
      .forEach(function (pair) {
        var li = el('li');
        var sw = el('span', 'swatch ' + statusClass(pair[0]));
        var t = document.createTextNode(pair[1]);
        li.appendChild(sw); li.appendChild(t);
        ul.appendChild(li);
      });
  }

  function normaliseFiles(files) {
    // assets.json paths are relative to design/, written as ../effects/...
    return (files || []).map(function (f) {
      return String(f).replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    });
  }

  function renderOntology() {
    var host = $('ontology');
    host.innerHTML = '';
    var ont = DATA.ontology;
    if (!ont || !ont.families) {
      host.textContent = 'No ontology was returned.';
      return;
    }
    var registers = ont.registers || REGISTER_ORDER;

    var table = el('table', 'matrix');
    var thead = el('thead');
    var htr = el('tr');
    var corner = el('th', 'corner'); corner.textContent = 'Type'; corner.scope = 'col';
    htr.appendChild(corner);
    registers.forEach(function (r) {
      var th = el('th'); th.scope = 'col'; th.textContent = cap(r); htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = el('tbody');
    ont.families.forEach(function (fam) {
      var frow = el('tr', 'fam-row');
      var fth = el('th'); fth.setAttribute('colspan', registers.length + 1); fth.scope = 'colgroup';
      fth.textContent = fam.family;
      frow.appendChild(fth);
      tbody.appendChild(frow);

      (fam.types || []).forEach(function (t) {
        var tr = el('tr', 'type-row');
        var th = el('th'); th.scope = 'row'; th.textContent = t.type;
        tr.appendChild(th);
        registers.forEach(function (r) {
          tr.appendChild(makeCell(fam.family, t.type, r, (t.cells || {})[r]));
        });
        tbody.appendChild(tr);
      });
    });
    table.appendChild(tbody);
    host.appendChild(table);
  }

  function makeCell(family, type, register, cell) {
    var td = el('td', 'cell');
    var status = cell ? cell.status : 'n/a';
    var files = cell ? normaliseFiles(cell.files) : [];
    var hasFiles = files.length > 0;
    var cls = 'cell-inner ' + statusClass(status);
    var node;
    if (hasFiles) {
      node = el('button', cls);
      node.type = 'button';
      node.textContent = String(files.length);
      node.setAttribute('aria-label',
        family + ', ' + type + ', ' + register + ': ' + status + ', ' + files.length + ' file' + (files.length > 1 ? 's' : ''));
      node.addEventListener('click', function () {
        openCell(family, type, register, status, files);
      });
    } else {
      node = el('span', cls);
      node.setAttribute('title', STATUS_LABELS[status] || status);
      node.setAttribute('aria-label', family + ', ' + type + ', ' + register + ': ' + (STATUS_LABELS[status] || status));
      node.textContent = status === 'synth' ? 'synth' : '';
    }
    td.appendChild(node);
    return td;
  }

  function openCell(family, type, register, status, files) {
    // Reuse the detail dialog to list a cell's files.
    var panel = $('detail');
    lastFocus = document.activeElement;
    $('detail-title').textContent = type + ' · ' + cap(register);
    $('detail-sub').textContent = family + ' family · ' + (STATUS_LABELS[status] || status);

    var bodyEl = $('detail-body');
    bodyEl.innerHTML = '';

    var ul = el('ul', 'ontology-files');
    files.forEach(function (rel) {
      var li = el('li');
      var it = itemByRelpath(rel);
      var b = el('button');
      b.type = 'button';
      var name = it ? it.title : rel.split('/').pop();
      b.innerHTML = esc(name) + ' <span class="fpath">' + esc(rel) + '</span>';
      b.addEventListener('click', function () {
        if (it) { openDetail(it); } else { announce('That file is not in the index.'); }
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    bodyEl.appendChild(ul);

    var actions = el('div', 'detail-actions');
    var jump = el('button');
    jump.type = 'button';
    jump.textContent = 'Show these in the gallery';
    jump.addEventListener('click', function () {
      FILTER.ont = { family: family, type: type, register: register };
      FILTER.text = '';
      $('search').value = '';
      closeDetail();
      setView('gallery');
      applyFilters();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    actions.appendChild(jump);
    bodyEl.appendChild(actions);

    panel.hidden = false;
    document.body.style.overflow = 'hidden';
    $('detail-close').focus();
  }

  function itemByRelpath(rel) {
    for (var i = 0; i < DATA.items.length; i++) {
      if (DATA.items[i].relpath === rel) return DATA.items[i];
    }
    return null;
  }

  // ---- view switching ---------------------------------------------------

  function setView(v) {
    VIEW = v;
    var gallery = v === 'gallery';
    $('gallery-view').hidden = !gallery;
    $('ontology-view').hidden = gallery;
    $('toolbar').hidden = !gallery;

    var gb = $('view-gallery'), ob = $('view-ontology');
    gb.classList.toggle('is-active', gallery);
    ob.classList.toggle('is-active', !gallery);
    gb.setAttribute('aria-pressed', gallery ? 'true' : 'false');
    ob.setAttribute('aria-pressed', !gallery ? 'true' : 'false');

    if (!gallery) {
      // Free the grid's live WebGL contexts while the matrix is shown.
      if (loadObs) loadObs.disconnect();
      if (unloadObs) unloadObs.disconnect();
    } else if (DATA) {
      setupObservers();
    }
  }

  function initViews() {
    $('view-gallery').addEventListener('click', function () { setView('gallery'); });
    $('view-ontology').addEventListener('click', function () { setView('ontology'); });

    var search = $('search');
    var t = null;
    search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        FILTER.text = search.value.trim().toLowerCase();
        applyFilters();
      }, 120);
    });

    $('active-filter-clear').addEventListener('click', function () {
      FILTER.ont = null;
      applyFilters();
    });
  }

  // ---- boot -------------------------------------------------------------

  initTheme();
  initViews();
  initDetail();
  load();
})();
