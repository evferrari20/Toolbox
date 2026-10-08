/* Toolbox UI: routing, pages, variants, walkthrough sync, Learn mode, saved progress. */
(function () {
  const TB = window.TB;
  const I = TB.ICONS;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const main = $('#main');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('tb:' + k);
        return v == null ? d : JSON.parse(v);
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('tb:' + k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  const byId = {};
  for (const c of TB.categories) for (const r of c.repairs) byId[r.id] = { cat: c, rep: r };

  /* Hidden categories stay out of menus, lists and search until unlocked on this device:
     tap the yellow wrench logo 5 times within 6 seconds (do it again to lock). */
  const unlocked = () => !!store.get('pv', false);
  const visibleCats = () => TB.categories.filter((c) => !c.hidden || unlocked());
  let taps = [];
  document.querySelector('.brand-mark').addEventListener('click', (e) => {
    // The logo is also the home link; handle navigation here so the unlock isn't overridden.
    e.preventDefault();
    const now = Date.now();
    taps = taps.filter((t) => now - t < 6000).concat(now);
    if (taps.length < 5) {
      if (location.hash) location.hash = '';
      return;
    }
    taps = [];
    const on = !unlocked();
    store.set('pv', on);
    celebrate(on ? 'Private garden unlocked' : 'Private garden hidden');
    if (location.hash === '#private' || (!on && !location.hash)) route();
    else location.hash = on ? 'private' : '';
  });
  const domainOf = (c) => TB.DOMAINS.find((d) => d.id === c.domain) || { id: c.domain, name: c.name, blurb: c.blurb };

  /* ---------- Variants ---------- */
  // A variant overrides any repair field (model, intro, steps, tools, safety, causes, learn, pro, ...).
  function variantId(r) {
    if (!r.variants || !r.variants.length) return null;
    const saved = store.get('variant:' + r.id, null);
    return r.variants.some((v) => v.id === saved) ? saved : r.defaultVariant || r.variants[0].id;
  }
  function effective(r, vid) {
    if (!vid || !r.variants) return r;
    const v = r.variants.find((x) => x.id === vid);
    if (!v) return r;
    const out = Object.assign({}, r, v, { id: r.id, title: r.title, variantName: v.name });
    if (v.learn && r.learn) out.learn = Object.assign({}, r.learn, v.learn);
    return out;
  }
  const progKey = (r, vid) => r.id + (vid ? '@' + vid : '');

  /* ---------- Learn mode ---------- */
  const toggle = $('#learn');
  function setLearn(on) {
    document.body.classList.toggle('learn', on);
    toggle.setAttribute('aria-checked', on ? 'true' : 'false');
    $('.learn-state', toggle).textContent = on ? 'On' : 'Off';
    store.set('learn', on);
  }
  toggle.addEventListener('click', () => setLearn(!document.body.classList.contains('learn')));
  setLearn(store.get('learn', false));

  /* ---------- Shared bits ---------- */
  // Every guide is either a Repair (fix what's broken) or a Build (add something new).
  // ...or Grow (plants, from seed to harvest).
  const kindOf = (r, c) => r.kind || (c && c.kind === 'project' ? 'build' : c && c.kind === 'grow' ? 'grow' : 'repair');
  const KIND_IDS = ['repair', 'build', 'grow'];
  const KINDS = {
    repair: { name: 'Repairs', one: 'Repair', door: 'Fix something', blurb: 'Fix what’s broken, worn out or not working right.' },
    build: { name: 'Builds', one: 'Build', door: 'Build something', blurb: 'Add onto what you have, or build something new from scratch.' },
    grow: { name: 'Grow', one: 'Grow', door: 'Grow something', blurb: 'Food, flowers and houseplants, from seed to harvest.' },
  };
  const KIND_ICON = { repair: I.wrench, build: I.cube, grow: I.sprout };
  const kindPill = (k) => `<span class="pill kind-${k}">${KIND_ICON[k]}${KINDS[k].one}</span>`;
  const splitByKind = (c) => Object.fromEntries(KIND_IDS.map((k) => [k, c.repairs.filter((r) => kindOf(r, c) === k)]));
  const countLine = (c) => {
    const s = splitByKind(c);
    const word = { repair: 'repair', build: 'build', grow: 'guide' };
    return KIND_IDS.filter((k) => s[k].length).map((k) => `${s[k].length} ${word[k]}${s[k].length > 1 ? 's' : ''}`).join(' · ');
  };
  const LEVEL = { 1: 'Easy', 2: 'Moderate', 3: 'Advanced' };
  const level = (n) => `<span class="pill lvl-${n}"><span class="dots">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>${LEVEL[n]}</span>`;
  const doneCount = (r) => {
    let n = 0;
    const vids = r.variants ? r.variants.map((v) => v.id) : [null];
    vids.forEach((v) => (n = Math.max(n, (store.get('done:' + progKey(r, v), []) || []).length)));
    return n;
  };
  const catIcon = (c) => `<span class="cat-ico d-${c.domain}">${I[c.id] || I[c.icon] || I.wrench}</span>`;

  /* ---------- Nav ---------- */
  const nav = $('#domnav');
  nav.innerHTML =
    KIND_IDS.map((k) => `<a href="#mode.${k}" class="mode kind-${k}" data-d="mode.${k}">${KIND_ICON[k]}${KINDS[k].name}</a>`).join('') + `<a href="#all" class="mode kind-items" data-d="all">${I.search}Filter</a><a href="#items" class="mode kind-items" data-d="items">${I.wrench}Tools A–Z</a><span class="nav-sep"></span>` +
    TB.DOMAINS.filter((d) => d.id !== 'grow' && TB.categories.some((c) => c.domain === d.id && !c.hidden))
      .map((d) => `<a href="#d.${d.id}" class="d-${d.id}" data-d="${d.id}">${esc(d.name)}</a>`)
      .join('');

  let viewer = null;
  let heroViewer = null;
  let playTimer = null;
  let keyHandler = null;
  let renderToken = 0;
  function teardown() {
    clearInterval(playTimer);
    playTimer = null;
    keyHandler = null;
    renderToken++;
    document.body.classList.remove('is-start');
    if (viewer) viewer.destroy();
    if (heroViewer) heroViewer.destroy();
    viewer = heroViewer = null;
  }
  document.addEventListener('keydown', (e) => keyHandler && keyHandler(e));

  /* ---------- Home ---------- */
  const POPULAR = ['faucet-drip', 'jump-start', 'fire-pit', 'toilet-running', 'flat-tire', 'dead-outlet', 'paver-patio', 'build-fire', 'bike-flat', 'deck-board'];
  const QUICK = ['Dripping faucet', 'Flat tire', 'Fire pit', 'Breaker', 'Garden bed', 'Wi-Fi'];

  function repCard(r, c, compact) {
    const done = doneCount(r);
    const n = r.steps.length;
    return `<a class="rep-card ${compact ? 'compact' : ''}" href="#${c.id}.${r.id}">
      <div class="rep-top">${catIcon(c)}<span class="rep-cat">${esc(c.name)}</span>${kindPill(kindOf(r, c))}${r.variants ? `<span class="pill var">${r.variants.length} versions</span>` : ''}</div>
      <h3>${esc(r.title)}</h3>
      ${compact ? '' : `<p>${esc(r.summary)}</p>`}
      <div class="meta">${level(r.level)}<span class="pill">${I.clock}${esc(r.time)}</span>${compact ? '' : `<span class="pill">${I.coin}${esc(r.cost)}</span>`}${
        done ? `<span class="pill prog">${done}/${n} done</span>` : `<span class="pill d3">${I.cube}3D · ${n} steps</span>`
      }</div>
    </a>`;
  }

  function renderHome() {
    const total = visibleCats().reduce((n, c) => n + c.repairs.length, 0);
    const pop = POPULAR.map((id) => byId[id]).filter((x) => x && !x.cat.hidden);
    let html = `<section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">${I.wrench} Home · Yard · Garage · Backyard</span>
        <h1>Fix it yourself.<br><span class="hl">See every step in 3D.</span></h1>
        <p>${total} repairs and builds with real, photo-scanned tools you can turn and zoom. Pick the version you have, follow the walkthrough, and switch on Learn mode for the why behind every step.</p>
        <label class="hero-search">${I.search}<input id="hq" type="search" placeholder="What needs fixing? Try “leaky faucet” or “fire pit”" aria-label="Search repairs" autocomplete="off"></label>
        <div class="quick">${QUICK.map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      </div>
      <div class="hero-stage">
        <div class="stage hero-3d" id="hero3d"><div class="v-loading">${I.cube}<span>Loading 3D…</span></div></div>
        <div class="badge b1">${I.cube}<b>Real scanned tools</b></div>
        <div class="badge b2">${I.bulb}<b>Learn mode</b></div>
        <div class="badge b3"><b>${total}</b> guides</div>
      </div>
    </section>

    <section class="doors">${KIND_IDS
      .map((k) => {
        const all = visibleCats().flatMap((c) => c.repairs.filter((r) => kindOf(r, c) === k).map((r) => ({ r, c })));
        return `<a class="door kind-${k}" href="#mode.${k}"><span class="door-ico">${KIND_ICON[k]}</span><div><h2>${KINDS[k].door}</h2><p>${KINDS[k].blurb}</p><span class="door-n">${all.length} guides →</span></div><ul>${all
          .slice(0, 4)
          .map(({ r }) => `<li>${esc(r.title)}</li>`)
          .join('')}</ul></a>`;
      })
      .join('')}</section>

    <section class="how">
      <div><span class="num">1</span><b>Pick what’s broken</b><p>Choose the exact version you have, from faucet type to car vs. diesel truck.</p></div>
      <div><span class="num">2</span><b>Follow it in 3D</b><p>The camera moves to each part, the right tool shows up, and the part you work on glows.</p></div>
      <div><span class="num">3</span><b>Learn the why</b><p>Turn on Learn mode for how the system works, key numbers, and common mistakes.</p></div>
    </section>

    <section class="block"><div class="block-head"><h2>Popular right now</h2></div>
      <div class="pop-row">${pop.map(({ rep, cat }) => repCard(rep, cat, true)).join('')}</div>
    </section>`;

    for (const d of TB.DOMAINS) {
      const cats = visibleCats().filter((c) => c.domain === d.id);
      if (!cats.length) continue;
      html += `<section class="block domain d-${d.id}" id="d-${d.id}"><div class="block-head"><h2>${esc(d.name)}</h2><p>${esc(d.blurb)}</p></div><div class="cat-grid">`;
      for (const c of cats) {
        html += `<a class="cat-card d-${c.domain}" href="#${c.id}">
          <div class="cat-top">${catIcon(c)}<span class="count">${countLine(c)}</span></div>
          <h3>${esc(c.name)}</h3>
          <ul>${c.repairs.map((r) => `<li>${esc(r.title)}</li>`).join('')}</ul>
        </a>`;
      }
      html += `</div></section>`;
    }
    main.innerHTML = html;
    document.title = 'Toolbox';
    $$('.chip[data-q]').forEach((b) => b.addEventListener('click', () => (location.hash = 'find=' + encodeURIComponent(b.dataset.q))));
    attachSearch($('#hq'));
    startHero();
  }

  function startHero() {
    const host = $('#hero3d');
    const name = TB.MODELS.hero ? 'hero' : Object.keys(TB.MODELS)[0];
    const tok = renderToken;
    const need = TB.needsFor(name, [], {});
    TB.preload(need).then(() => {
      if (tok !== renderToken || !host.isConnected) return;
      heroViewer = new TB.Viewer(host, {});
      if (heroViewer.failed) return;
      heroViewer.setLabels(false);
      heroViewer.load(name);
      heroViewer.go({ spin: true }, null, false);
      host.classList.add('ready');
    });
  }

  /* ---------- Domain + category ---------- */
  // Two labeled groups, Repairs then Builds, skipping an empty one.
  function kindGroups(c, list) {
    const s = list || splitByKind(c);
    return KIND_IDS
      .filter((k) => s[k].length)
      .map((k) => `<div class="kind-group kind-${k}"><h3 class="kind-h">${KIND_ICON[k]}${KINDS[k].name}<small>${KINDS[k].blurb}</small></h3><div class="rep-list">${s[k].map((r) => repCard(r, c)).join('')}</div></div>`)
      .join('');
  }

  function renderDomain(d) {
    const cats = visibleCats().filter((c) => c.domain === d.id);
    main.innerHTML = `<nav class="crumbs"><a href="#home">Home</a><span class="sep">/</span><span>${esc(d.name)}</span></nav>
      <header class="page-head d-${d.id}"><div><h1>${esc(d.name)}</h1><p>${esc(d.blurb)}</p></div></header>
      ${cats.map((c) => `<section class="block"><div class="block-head">${catIcon(c)}<h2><a href="#${c.id}">${esc(c.name)}</a></h2><p>${esc(c.blurb)}</p></div>${kindGroups(c)}</section>`).join('')}`;
    document.title = d.name + ' · Toolbox';
  }

  /* ---------- Filters ----------
     Narrow any guide list by type, area, difficulty, time, cost and renter-friendly. Choices are kept on this device. */
  const parseMinutes = (s) => {
    s = String(s || '');
    const m = s.match(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*\+?\s*(min|minute|hr|hour|h\b|day|weekend|week)/i);
    if (!m) return /weekend/i.test(s) ? 960 : null;
    const u = m[3].toLowerCase();
    const mult = u.startsWith('min') ? 1 : u.startsWith('h') ? 60 : u.startsWith('weekend') ? 960 : u.startsWith('week') ? 2400 : 480;
    return parseFloat(m[1]) * mult;
  };
  const parseCost = (s) => {
    const m = String(s || '').match(/\$\s*(\d[\d,]*)/);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : /free|\$0/i.test(String(s)) ? 0 : null;
  };
  const FACETS = {
    kind: { label: 'Type', opts: KIND_IDS.map((k) => [k, KINDS[k].one]), test: (r, c, v) => kindOf(r, c) === v },
    area: { label: 'Area', opts: TB.DOMAINS.map((d) => [d.id, d.name]), test: (r, c, v) => c.domain === v },
    level: { label: 'Difficulty', opts: [['1', 'Easy'], ['2', 'Moderate'], ['3', 'Advanced']], test: (r, c, v) => String(Math.min(3, r.level || 1)) === v },
    time: {
      label: 'Time',
      opts: [['30', 'Under 30 min'], ['120', 'Under 2 hrs'], ['480', 'Under a day'], ['big', 'Weekend +']],
      test: (r, c, v) => {
        const m = parseMinutes(r.time);
        if (m == null) return false;
        return v === 'big' ? m > 480 : m <= +v;
      },
    },
    cost: {
      label: 'Cost',
      opts: [['0', 'Free / on hand'], ['25', 'Under $25'], ['100', 'Under $100'], ['500', 'Under $500'], ['big', '$500 +']],
      test: (r, c, v) => {
        const n = parseCost(r.cost);
        if (n == null) return v === '0' && /free/i.test(r.cost || '');
        return v === 'big' ? n >= 500 : v === '0' ? n === 0 : n < +v;
      },
    },
  };
  let filt = store.get('filters', {}) || {};
  const fActive = (skip) => Object.entries(filt).filter(([k, v]) => v && v.length && !(skip || []).includes(k) && (FACETS[k] || k === 'renter'));
  const passes = (r, c, skip) =>
    fActive(skip).every(([k, v]) => (k === 'renter' ? !!r.renter : v.some((x) => FACETS[k].test(r, c, x))));
  function filterBar(skip, onChange, count) {
    const n = fActive(skip).length;
    const bar = `<section class="filters ${n ? 'has' : ''}" aria-label="Filters">
      <div class="f-head"><b>${I.search} Filter</b><span class="f-count">${count != null ? `${count} guide${count === 1 ? '' : 's'}` : ''}</span>${n ? '<button class="linkbtn" data-fclear>Clear all</button>' : ''}</div>
      <div class="f-rows">${Object.entries(FACETS)
        .filter(([k]) => !(skip || []).includes(k))
        .map(
          ([k, f]) => `<div class="f-row"><span class="f-lab">${f.label}</span><div class="f-chips">${f.opts
            .filter(([v]) => k !== 'area' || visibleCats().some((c) => c.domain === v))
            .map(([v, t]) => `<button class="fchip ${(filt[k] || []).includes(v) ? 'on' : ''}" data-f="${k}" data-v="${esc(v)}" aria-pressed="${(filt[k] || []).includes(v)}">${esc(t)}</button>`)
            .join('')}</div></div>`
        )
        .join('')}
        <div class="f-row"><span class="f-lab">Living</span><div class="f-chips"><button class="fchip renter ${filt.renter ? 'on' : ''}" data-f="renter" aria-pressed="${!!filt.renter}">${I.doors || ''}Renter-friendly</button></div></div>
      </div>
    </section>`;
    setTimeout(() => {
      $$('.fchip').forEach((b) =>
        b.addEventListener('click', () => {
          const k = b.dataset.f;
          if (k === 'renter') filt.renter = filt.renter ? 0 : [1];
          else {
            const cur = new Set(filt[k] || []);
            cur.has(b.dataset.v) ? cur.delete(b.dataset.v) : cur.add(b.dataset.v);
            filt[k] = [...cur];
          }
          store.set('filters', filt);
          const y = scrollY;
          onChange();
          scrollTo(0, y);
        })
      );
      const cl = $('[data-fclear]');
      if (cl) cl.addEventListener('click', () => ((filt = {}), store.set('filters', filt), onChange()));
    });
    return bar;
  }
  // Every guide, filtered: the "Browse & filter" page.
  function renderAll() {
    const all = visibleCats().flatMap((c) => c.repairs.map((r) => ({ r, c })));
    const hits = all.filter(({ r, c }) => passes(r, c));
    main.innerHTML = `<nav class="crumbs"><a href="#home">Home</a><span class="sep">/</span><span>Browse & filter</span></nav>
      <header class="page-head"><span class="cat-ico big">${I.search}</span><div><h1>Find the right guide</h1><p>Pick what matters (time, cost, difficulty, renting) and the list narrows as you tap.</p></div></header>
      ${filterBar([], renderAll, hits.length)}
      ${hits.length ? `<div class="rep-list">${hits.map(({ r, c }) => repCard(r, c)).join('')}</div>` : '<p class="empty">Nothing fits all of those. Clear a filter or two.</p>'}`;
    document.title = 'Browse & filter · Toolbox';
  }

  // All repairs, or all builds, across every section.
  function renderMode(k) {
    let html = `<nav class="crumbs"><a href="#home">Home</a><span class="sep">/</span><span>${KINDS[k].name}</span></nav>
      <header class="page-head kind-${k}"><span class="cat-ico big kind-${k}">${KIND_ICON[k]}</span><div><h1>${KINDS[k].name}</h1><p>${KINDS[k].blurb}</p></div></header>`;
    const skip = k === 'grow' ? ['kind', 'area'] : ['kind'];
    const ok = (r, c) => passes(r, c, skip);
    const total = visibleCats().reduce((n, c) => n + splitByKind(c)[k].filter((r) => ok(r, c)).length, 0);
    html += filterBar(skip, () => renderMode(k), total);
    if (!total) html += '<p class="empty">Nothing fits all of those. Clear a filter or two.</p>';
    if (k === 'grow') {
      for (const c of visibleCats().filter((x) => splitByKind(x).grow.some((r) => ok(r, x))))
        html += `<section class="block"><div class="block-head">${catIcon(c)}<h2><a href="#${c.id}">${esc(c.name)}</a></h2><p>${esc(c.blurb)}</p></div><div class="rep-list">${splitByKind(c)
          .grow.filter((r) => ok(r, c))
          .map((r) => repCard(r, c))
          .join('')}</div></section>`;
      main.innerHTML = html;
      document.title = 'Grow · Toolbox';
      return;
    }
    for (const d of TB.DOMAINS) {
      const cats = visibleCats().filter((c) => c.domain === d.id && splitByKind(c)[k].some((r) => ok(r, c)));
      if (!cats.length) continue;
      html += `<section class="block domain d-${d.id}"><div class="block-head"><h2>${esc(d.name)}</h2></div><div class="rep-list">${cats
        .flatMap((c) => splitByKind(c)[k].filter((r) => ok(r, c)).map((r) => repCard(r, c)))
        .join('')}</div></section>`;
    }
    main.innerHTML = html;
    document.title = KINDS[k].name + ' · Toolbox';
  }

  function renderCategory(c) {
    const d = domainOf(c);
    const dl = TB.DOMAINS.includes(d) ? `<a href="#d.${d.id}">${esc(d.name)}</a><span class="sep">/</span>` : '';
    main.innerHTML = `<nav class="crumbs"><a href="#home">Home</a><span class="sep">/</span>${dl}<span>${esc(c.name)}</span></nav>${c.hidden ? '<p class="private-note">Only visible on this device. Tap the yellow wrench logo 5 times to hide it again.</p>' : ''}
      <header class="page-head d-${c.domain}">${catIcon(c)}<div><h1>${esc(c.name)}</h1><p>${esc(c.blurb)}</p></div></header>
      ${kindGroups(c)}`;
    document.title = c.name + ' · Toolbox';
  }

  /* ---------- Items: complete kit lists + explanations ---------- */
  TB.ITEMS = TB.ITEMS || {};
  TB.KITS = TB.KITS || {};
  const hostOf = (u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch (e) {
      return u;
    }
  };
  const KGROUPS = [
    ['Tools', ['tool', 'power-tool', 'measure']],
    ['Materials & parts', ['material', 'part']],
    ['Fasteners & hardware', ['fastener']],
    ['Adhesives, sealants & supplies', ['adhesive', 'consumable']],
    ['Safety gear', ['safety']],
  ];
  const KIND_LABEL = { tool: 'Tool', 'power-tool': 'Power tool', measure: 'Measuring & layout', material: 'Material', part: 'Part', fastener: 'Fastener & hardware', adhesive: 'Adhesive & sealant', consumable: 'Supply', safety: 'Safety gear' };
  const groupOf = (kind) => (KGROUPS.find(([, ks]) => ks.includes(kind)) || KGROUPS[1])[0];
  // item key -> [{rep, cat}] where it's used
  const usedIn = {};
  Object.entries(TB.KITS).forEach(([gk, kit]) => {
    const gid = gk.split('@')[0];
    const hit = byId[gid];
    if (!hit) return;
    (kit.items || []).forEach((it) => {
      const arr = (usedIn[it.key] = usedIn[it.key] || []);
      if (!arr.some((x) => x.rep.id === gid)) arr.push(hit);
    });
  });
  const itemByName = {};
  Object.entries(TB.ITEMS).forEach(([k, v]) => (itemByName[v.name.toLowerCase()] = k));
  const norm = (t) => String(t).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const normIdx = {};
  Object.entries(TB.ITEMS).forEach(([k, v]) => (normIdx[norm(v.name)] = k));
  const keyForName = (t) => itemByName[String(t).toLowerCase()] || normIdx[norm(t)] || (TB.ITEMS[norm(t).replace(/ /g, '-')] ? norm(t).replace(/ /g, '-') : null);
  const infoBtn = (key) => (TB.ITEMS[key] ? `<button class="info" data-info="${esc(key)}" aria-label="What is this?" title="What is this?">i</button>` : '');

  function kitSection(kit, toolSet, rid) {
    const items = kit.items.map((it, i) => Object.assign({ i }, it));
    const groups = KGROUPS.map(([g]) => [g, items.filter((it) => groupOf(it.kind) === g)]).filter(([, l]) => l.length);
    return `<section class="section kit"><h2>Everything you need <small>${items.length} items · tap to check off · ⓘ explains each one</small></h2>
      ${groups
        .map(
          ([g, list]) => `<h3 class="kit-h">${esc(g)} <span>${list.length}</span></h3><ul class="kit-list">${list
            .map(
              (it) => `<li><button class="kit-chk" data-tool="${it.i}" aria-pressed="${toolSet.has(it.i)}"><span class="tick">${I.check}</span><span class="kit-name"><b>${esc(it.name)}</b>${it.spec ? `<em>${esc(it.spec)}</em>` : ''}</span></button>${infoBtn(it.key)}</li>`
            )
            .join('')}</ul>`
        )
        .join('')}
      ${TB.shopBlock ? TB.shopBlock(items.filter((it) => it.kind !== 'safety').map((it) => it.name), rid) : ''}
    </section>`;
  }

  // Item explanation dialog (delegated from any [data-info] button).
  let dlg;
  function showItem(key) {
    const it = TB.ITEMS[key];
    if (!it) return;
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'item-dlg';
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg || e.target.closest('.dlg-x')) dlg.close();
        if (e.target.closest('a[href^="#"]')) dlg.close();
      });
    }
    const uses = usedIn[key] || [];
    const shop = TB.AFFILIATE && TB.AFFILIATE.enabled && TB.shopBlock ? TB.shopBlock([it.name], key) : '';
    dlg.innerHTML = `<div class="dlg-in">
      <button class="dlg-x" aria-label="Close">×</button>
      <span class="kind-tag k-${esc(it.kind)}">${esc(KIND_LABEL[it.kind] || it.kind)}</span>
      <h2>${esc(it.name)}</h2>
      <p class="what">${esc(it.what)}</p>
      ${it.uses && it.uses.length ? `<h3>Common uses</h3><ul>${it.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>` : ''}
      ${it.tip ? `<p class="dlg-tip">${I.bulb}<span>${esc(it.tip)}</span></p>` : ''}
      ${uses.length ? `<h3>Used in ${uses.length} guide${uses.length > 1 ? 's' : ''}</h3><div class="dlg-uses">${uses
        .slice(0, 12)
        .map(({ rep, cat }) => `<a href="#${cat.id}.${rep.id}">${esc(rep.title)}</a>`)
        .join('')}</div>` : ''}
      ${shop}
    </div>`;
    dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-info]');
    if (b) {
      e.preventDefault();
      e.stopPropagation();
      showItem(b.dataset.info);
    }
  });

  /* ---------- Tools & materials A–Z ---------- */
  function renderItems() {
    const all = Object.entries(TB.ITEMS).sort((a, b) => a[1].name.localeCompare(b[1].name));
    main.innerHTML = `<header class="page-head"><div><h1>Tools & materials A–Z</h1><p>Every tool, part, fastener and supply used across Toolbox (${all.length} items). Tap any item to see what it does, common uses, and which guides need it.</p></div></header>
      <div class="az-bar"><label class="search az-search">${I.search}<input id="azq" type="search" placeholder="Filter: wrench, caulk, screw…" autocomplete="off"></label>
      <div class="az-kinds">${['all'].concat(KGROUPS.map(([g]) => g)).map((g, i) => `<button class="chip ${i ? '' : 'on'}" data-g="${esc(g)}">${esc(g === 'all' ? 'All' : g)}</button>`).join('')}</div></div>
      <div class="az-grid" id="azg"></div>`;
    let gsel = 'all';
    const paint = () => {
      const qv = $('#azq').value.trim().toLowerCase();
      const list = all.filter(([k, v]) => (gsel === 'all' || groupOf(v.kind) === gsel) && (!qv || (v.name + ' ' + v.what + ' ' + (v.uses || []).join(' ')).toLowerCase().includes(qv)));
      $('#azg').innerHTML = list.length
        ? list
            .map(
              ([k, v]) => `<button class="az-card" data-info="${esc(k)}"><span class="kind-tag k-${esc(v.kind)}">${esc(KIND_LABEL[v.kind] || v.kind)}</span><b>${esc(v.name)}</b><span>${esc(v.what)}</span><em>${(usedIn[k] || []).length ? `Used in ${(usedIn[k] || []).length} guide${(usedIn[k] || []).length > 1 ? 's' : ''}` : 'Add-on item'}</em></button>`
            )
            .join('')
        : '<p class="empty">Nothing matches that filter.</p>';
    };
    $('#azq').addEventListener('input', paint);
    $$('.az-kinds .chip').forEach((b) =>
      b.addEventListener('click', () => {
        gsel = b.dataset.g;
        $$('.az-kinds .chip').forEach((x) => x.classList.toggle('on', x === b));
        paint();
      })
    );
    paint();
    document.title = 'Tools & materials A–Z · Toolbox';
  }

  /* ---------- Build add-ons ---------- */
  const money = (lo, hi) => '$' + lo.toLocaleString() + (hi > lo ? '–$' + hi.toLocaleString() : '');
  function addonSection(r) {
    return `<section class="addons" aria-label="Add-ons">
      <div class="ao-head"><div><h2>Make it yours</h2><p>Extras that pair well with this build. Pick any and they show up on the finished model.</p></div><div class="ao-side"><div class="ao-total" id="ao-total"></div><div class="ao-bulk"><button class="linkbtn" id="ao-all">Select all</button><button class="linkbtn" id="ao-none">Clear</button></div></div></div>
      <div class="ao-grid">${r.addons
        .map(
          (a) => `<button class="ao" data-ao="${esc(a.id)}" aria-pressed="false"><span class="ao-tog" aria-hidden="true">${I.check}</span><span class="ao-cat c-${esc(a.cat.toLowerCase())}">${esc(a.cat)}</span><b>${esc(a.name)}</b><span class="ao-blurb">${esc(a.blurb)}</span><span class="ao-foot"><span class="ao-cost">+${money(a.cost[0], a.cost[1])}</span><span class="ao-state"></span></span></button>`
        )
        .join('')}</div>
      <div class="ao-plan" id="ao-plan"></div>
    </section>`;
  }


  /* ---------- Repair ---------- */
  function renderRepair(c, base) {
    const vid = variantId(base);
    const r = effective(base, vid);
    const key = progKey(base, vid);
    const doneSet = new Set(store.get('done:' + key, []));
    const kit = TB.KITS && (TB.KITS[base.id + '@' + vid] || TB.KITS[base.id]);
    const toolSet = new Set(store.get((kit ? 'kit:' : 'tools:') + key, []));
    const L = r.learn || {};
    const steps = r.steps;
    const n = steps.length;
    const d = domainOf(c);

    main.innerHTML = `<nav class="crumbs"><a href="#home">Home</a><span class="sep">/</span><a href="#${c.id}">${esc(c.name)}</a><span class="sep">/</span><span>${esc(r.title)}</span></nav>
    <header class="rep-head d-${c.domain}">
      <div class="rep-head-main">
        <div class="rep-top">${catIcon(c)}<span class="rep-cat">${esc(c.name)}</span>${kindPill(kindOf(base, c))}</div>
        <h1>${esc(r.title)}</h1>
        <p class="summary">${esc(r.summary)}</p>
      </div>
      <div class="facts">
        <div><span>Difficulty</span>${level(r.level)}</div>
        <div><span>Time</span><b>${esc(r.time)}</b></div>
        <div><span>Cost</span><b id="f-cost">${esc(r.cost)}</b></div>
        <div><span>Steps</span><b>${n}</b></div>
      </div>
    </header>

    ${base.variants ? `<section class="variants" aria-label="Choose your version">
      <h2>${{ build: 'Pick your design', grow: 'Pick what you’re growing' }[kindOf(base, c)] || 'Which one do you have?'}</h2>
      <div class="var-row" role="radiogroup">${base.variants
        .map(
          (v) => `<button class="var ${v.id === vid ? 'on' : ''}" role="radio" aria-checked="${v.id === vid}" data-v="${v.id}"><b>${esc(v.name)}</b><span>${esc(v.blurb || '')}</span>${
            v.level ? `<span class="var-meta">${level(v.level)}<span class="pill">${I.clock}${esc(v.time || '')}</span><span class="pill">${I.coin}${esc(v.cost || '')}</span></span>` : ''
          }</button>`
        )
        .join('')}</div>
    </section>` : ''}
    ${r.addons && r.addons.length ? addonSection(r) : ''}

    <div class="repair">
      <div class="stage-col">
        <div class="stage" id="stage">
          <div class="v-loading">${I.cube}<span>Loading 3D models…</span></div>
          <div class="stage-tools">
            <button class="tool-btn" id="t-reset" title="Return camera to this step">${I.reset}<span>View</span></button>
            <button class="tool-btn" id="t-xray" aria-pressed="false" title="See through housings">${I.xray}<span>X-ray</span></button>
            <button class="tool-btn" id="t-labels" aria-pressed="true" title="Show part labels">${I.tag}<span>Labels</span></button>
          </div>
          <div class="pick-toast" id="pick"></div>
          <div class="stage-hint">Drag to rotate · scroll or pinch to zoom · tap any part or tool</div>
        </div>
        <div class="walk" aria-live="polite">
          <div class="walk-top"><span class="walk-step" id="w-step"></span><span class="walk-title" id="w-title"></span></div>
          <p class="walk-text" id="w-text"></p>
          <div class="walk-ctrl">
            <button class="btn icon" id="w-prev" aria-label="Previous step">${I.prev}</button>
            <button class="btn primary" id="w-next"></button>
            <button class="btn icon" id="w-play" aria-label="Play walkthrough">${I.play}</button>
            <div class="ticks" id="w-ticks">${['Overview'].concat(steps.map((s) => s.t)).map((t, i) => `<button title="${esc(i ? i + '. ' + t : t)}" data-i="${i}" aria-label="${esc(t)}"></button>`).join('')}</div>
          </div>
        </div>
      </div>

      <article class="doc">
        ${L.how ? `<section class="section learn-only learn-panel"><h2>${I.bulb} How it works</h2><p class="how">${esc(L.how)}</p>
          ${L.specs && L.specs.length ? `<div class="specs">${L.specs.map(([k, v]) => `<div class="spec"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
        </section>` : ''}

        ${r.card && r.card.length ? `<section class="section glance"><h2>${I.sprout} At a glance</h2><div class="glance-grid">${r.card
          .map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`)
          .join('')}</div></section>` : ''}

        <section class="section box safety"><h2>${I.shield} Safety first</h2><ul>${r.safety.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>

        <section class="section"><h2>${kindOf(base, c) === 'repair' ? 'Likely causes' : 'Plan it'}</h2><div class="causes">${r.causes
          .map(([t, dd], i) => `<div class="cause"><span class="n">${i + 1}</span><b>${esc(t)}</b>${dd ? `<p>${esc(dd)}</p>` : ''}</div>`)
          .join('')}</div></section>

        ${kit ? kitSection(kit, toolSet, r.id) : `<section class="section"><h2>Tools & parts <small>tap to check off</small></h2><ul class="tools">${r.tools
          .map((t, i) => `<li><button data-tool="${i}" aria-pressed="${toolSet.has(i)}"><span class="tick">${I.check}</span>${esc(t)}</button></li>`)
          .join('')}</ul>${TB.shopBlock ? TB.shopBlock(r.tools, r.id) : ''}</section>`}

        <section class="section"><h2>Steps <small>tap the number when done</small></h2><ol class="steps" id="steps">${steps
          .map(
            (s, i) => `<li class="step ${doneSet.has(i) ? 'done' : ''}" id="s${i + 1}">
              <button class="step-num" data-done="${i}" aria-pressed="${doneSet.has(i)}" aria-label="Mark step ${i + 1} done"><span>${i + 1}</span>${I.check}</button>
              <div class="step-t"><span>${esc(s.t)}</span><button class="view" data-go="${i + 1}">${I.cube} Show in 3D</button></div>
              <p class="step-d">${esc(s.d)}</p>
              <div class="step-x">${s.tip ? `<p class="step-tip">${I.bulb}<span><b>Tip</b> ${esc(s.tip)}</span></p>` : ''}${s.ok ? `<p class="step-ok">${I.check}<span><b>Check</b> ${esc(s.ok)}</span></p>` : ''}${s.why ? `<div class="why learn-only"><b>WHY</b><span>${esc(s.why)}</span></div>` : ''}</div>
            </li>`
          )
          .join('')}</ol>
          <div class="progress"><div class="bar"><i id="prog-bar"></i></div><span id="prog-text"></span><button class="linkbtn" id="clear">Reset</button></div>
        </section>

        ${r.tricks && r.tricks.length ? `<section class="section"><h2>Tips &amp; tricks</h2><div class="tricks">${r.tricks
          .map(([t, dd]) => `<div class="trick">${I.bulb}<div><b>${esc(t)}</b><p>${esc(dd)}</p></div></div>`)
          .join('')}</div></section>` : ''}

        ${kit && kit.proTips && kit.proTips.length ? `<section class="section box pros"><h2>${I.bulb} From the pros</h2><ul>${kit.proTips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>${
          kit.sources && kit.sources.length ? `<p class="srcs">Sources: ${kit.sources.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(hostOf(u))}</a>`).join(' · ')}</p>` : ''
        }</section>` : ''}

        ${L.terms && L.terms.length ? `<section class="section learn-only"><h2>Know the terms</h2><dl class="terms">${L.terms.map(([t, dd]) => `<div><dt>${esc(t)}</dt><dd>${esc(dd)}</dd></div>`).join('')}</dl></section>` : ''}

        ${(L.mistakes && L.mistakes.length) || (L.tips && L.tips.length) ? `<section class="section learn-only"><div class="two">
          ${L.mistakes && L.mistakes.length ? `<div class="card"><h3>Common mistakes</h3><ul class="mlist bad">${L.mistakes.map((m) => `<li><span>${esc(m)}</span></li>`).join('')}</ul></div>` : ''}
          ${L.tips && L.tips.length ? `<div class="card"><h3>Pro tips</h3><ul class="mlist good">${L.tips.map((m) => `<li><span>${esc(m)}</span></li>`).join('')}</ul></div>` : ''}
        </div></section>` : ''}

        <section class="section box pro"><h2>${I.phone} Call a pro if</h2><p>${esc(r.pro)}</p></section>

        ${r.refs && r.refs.length ? `<section class="section refs"><h2>Researched from</h2><ul>${r.refs
          .map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a> <span>${esc(hostOf(u))}</span></li>`)
          .join('')}</ul></section>` : ''}
      </article>
    </div>`;
    document.title = r.title + ' · Toolbox';

    $$('.var').forEach((b) =>
      b.addEventListener('click', () => {
        if (b.dataset.v === vid) return;
        store.set('variant:' + base.id, b.dataset.v);
        const y = scrollY;
        route();
        scrollTo(0, y);
      })
    );

    $$('[data-tool]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = +b.dataset.tool;
        toolSet.has(i) ? toolSet.delete(i) : toolSet.add(i);
        b.setAttribute('aria-pressed', toolSet.has(i));
        store.set((kit ? 'kit:' : 'tools:') + key, [...toolSet]);
      })
    );

    const paintProg = () => {
      $('#prog-text').textContent = `${doneSet.size} of ${n} steps done`;
      $('#prog-bar').style.width = (doneSet.size / n) * 100 + '%';
      $$('#w-ticks button').forEach((b) => b.classList.toggle('done', +b.dataset.i > 0 && doneSet.has(+b.dataset.i - 1)));
    };
    $$('[data-done]').forEach((b) =>
      b.addEventListener('click', () => {
        const i = +b.dataset.done;
        const was = doneSet.size;
        doneSet.has(i) ? doneSet.delete(i) : doneSet.add(i);
        b.setAttribute('aria-pressed', doneSet.has(i));
        b.closest('.step').classList.toggle('done', doneSet.has(i));
        store.set('done:' + key, [...doneSet]);
        paintProg();
        if (doneSet.size === n && was < n) celebrate({ build: 'Built it!', grow: 'You grew it!' }[kindOf(base, c)] || 'Fixed it!');
      })
    );
    $('#clear').addEventListener('click', () => {
      doneSet.clear();
      toolSet.clear();
      store.set('done:' + key, []);
      store.set((kit ? 'kit:' : 'tools:') + key, []);
      $$('.step').forEach((s) => s.classList.remove('done'));
      $$('[data-done],[data-tool]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      paintProg();
    });

    /* 3D walkthrough */
    const stage = $('#stage');
    const pickEl = $('#pick');
    let pickT;
    let cur = 0;
    const poseAt = (i) => (i === 0 ? r.intro || {} : steps[i - 1].v || {});
    const states = TB.buildStates(steps, r.model, r.intro);
    const AO = r.addons || [];
    const aoKey = 'addons:' + key;
    const aoOn = new Set(store.get(aoKey, []).filter((id) => AO.some((a) => a.id === id)));
    if (AO.length) {
      states[0].addons = !!(r.intro && r.intro.preview);
      states[n].addons = true;
    }
    const aoParts = () => AO.filter((a) => aoOn.has(a.id)).map((a) => a.part);
    function paintAddons() {
      if (!AO.length) return;
      const picked = AO.filter((a) => aoOn.has(a.id));
      $$('[data-ao]').forEach((b) => b.setAttribute('aria-pressed', aoOn.has(b.dataset.ao)));
      const lo = picked.reduce((t, a) => t + a.cost[0], 0);
      const hi = picked.reduce((t, a) => t + a.cost[1], 0);
      $('#ao-total').innerHTML = picked.length ? `<b>${picked.length}</b> add-on${picked.length > 1 ? 's' : ''} · <b>+${money(lo, hi)}</b>` : 'Tap to add. They appear on the finished build in 3D.';
      $('#f-cost').innerHTML = esc(r.cost) + (picked.length ? `<small>+ ${money(lo, hi)} add-ons</small>` : '');
      $('#ao-plan').innerHTML = picked.length
        ? `<h3>Your add-on plan</h3><ol class="ao-steps">${picked
            .map((a) => `<li><b>${esc(a.name)}</b><span>${esc(a.how)}</span>${a.needs ? `<em>Need: ${a.needs.map((nd) => esc(nd) + (keyForName(nd) ? infoBtn(keyForName(nd)) : '')).join(' · ')}</em>` : ''}</li>`)
            .join('')}</ol>${TB.shopBlock ? TB.shopBlock(picked.map((a) => a.shop || a.name), r.id + '-addons') : ''}`
        : '';
    }
    const bulk = (on) => {
      AO.forEach((a) => (on ? aoOn.add(a.id) : aoOn.delete(a.id)));
      store.set(aoKey, [...aoOn]);
      paintAddons();
      if (!viewer) return;
      viewer.setAddons(AO.map((x) => x.part), aoParts());
      stopPlay();
      go(states[0].addons && cur === 0 ? 0 : n);
    };
    if (AO.length) {
      $('#ao-all').addEventListener('click', () => bulk(true));
      $('#ao-none').addEventListener('click', () => bulk(false));
    }
    $$('[data-ao]').forEach((b) =>
      b.addEventListener('click', () => {
        const a = AO.find((x) => x.id === b.dataset.ao);
        const on = !aoOn.has(a.id);
        on ? aoOn.add(a.id) : aoOn.delete(a.id);
        store.set(aoKey, [...aoOn]);
        paintAddons();
        if (!viewer) return;
        viewer.setAddons(AO.map((x) => x.part), aoParts());
        stopPlay();
        go(states[0].addons && cur === 0 ? 0 : n);
        if (on) {
          viewer.hi = new Set([a.part]);
          viewer.kick();
        }
        if (innerWidth <= 980) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
    );

    function go(i, opts) {
      opts = opts || {};
      cur = Math.max(0, Math.min(n, i));
      if (viewer) viewer.go(poseAt(cur), states[cur], opts.animate !== false);
      $('#w-step').textContent = cur === 0 ? 'Overview' : `Step ${cur} of ${n}`;
      $('#w-title').textContent = cur === 0 ? r.title + (r.variantName ? ' · ' + r.variantName : '') : steps[cur - 1].t;
      $('#w-text').textContent = cur === 0 ? 'Press Start to walk through it. The part you work on glows yellow, and the tool for each step appears in place.' : steps[cur - 1].d;
      $('#w-prev').disabled = cur === 0;
      $('#w-next').innerHTML = (cur === 0 ? 'Start' : cur === n ? 'Back to start' : 'Next step') + I.next;
      $$('#w-ticks button').forEach((b) => b.classList.toggle('cur', +b.dataset.i === cur));
      $$('.step').forEach((s, k) => s.classList.toggle('cur', k === cur - 1));
      if (opts.scroll && cur > 0 && innerWidth > 980) {
        const el = $('#s' + cur);
        const rr = el.getBoundingClientRect();
        if (rr.top < 90 || rr.bottom > innerHeight) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    function stopPlay() {
      clearInterval(playTimer);
      playTimer = null;
      $('#w-play').innerHTML = I.play;
      $('#w-play').setAttribute('aria-label', 'Play walkthrough');
    }
    $('#w-prev').addEventListener('click', () => (stopPlay(), go(cur - 1, { scroll: true })));
    $('#w-next').addEventListener('click', () => (stopPlay(), go(cur === n ? 0 : cur + 1, { scroll: true })));
    $('#w-play').addEventListener('click', () => {
      if (playTimer) return stopPlay();
      if (cur === n) go(0);
      $('#w-play').innerHTML = I.pause;
      $('#w-play').setAttribute('aria-label', 'Pause walkthrough');
      go(cur + 1, { scroll: true });
      playTimer = setInterval(() => (cur >= n ? stopPlay() : go(cur + 1, { scroll: true })), 5600);
    });
    $$('#w-ticks button').forEach((b) => b.addEventListener('click', () => (stopPlay(), go(+b.dataset.i))));
    $$('[data-go]').forEach((b) =>
      b.addEventListener('click', () => {
        stopPlay();
        go(+b.dataset.go);
        if (innerWidth <= 980) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
    );
    $('#t-reset').addEventListener('click', () => {
      if (!viewer) return;
      const p = poseAt(cur);
      const v = TB.MODELS[r.model].view;
      viewer.setCam(p.cam || v.cam, p.at || v.at, true);
    });
    $('#t-xray').addEventListener('click', (e) => {
      const b = e.currentTarget;
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      if (viewer) viewer.setXray(on);
    });
    $('#t-labels').addEventListener('click', (e) => {
      const b = e.currentTarget;
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      if (viewer) viewer.setLabels(on);
    });
    keyHandler = (e) => {
      if (/input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') (stopPlay(), go(cur + 1, { scroll: true }));
      if (e.key === 'ArrowLeft') (stopPlay(), go(cur - 1, { scroll: true }));
    };
    paintProg();
    paintAddons();
    go(0, { animate: false });

    const tok = renderToken;
    TB.preload(TB.needsFor(r.model, steps, r.intro)).then(() => {
      if (tok !== renderToken) return;
      viewer = new TB.Viewer(stage, {
        onPick(_, label) {
          const ik = itemByName[String(label).toLowerCase()];
          pickEl.innerHTML = esc(label) + (ik ? ' ' + infoBtn(ik) : '');
          pickEl.classList.add('show');
          clearTimeout(pickT);
          pickT = setTimeout(() => pickEl.classList.remove('show'), 1800);
        },
      });
      viewer.load(r.model);
      viewer.setAddons(AO.map((x) => x.part), aoParts());
      window.TB_VIEWER = viewer;
      stage.classList.add('ready');
      viewer.setXray($('#t-xray').getAttribute('aria-pressed') === 'true');
      viewer.setLabels($('#t-labels').getAttribute('aria-pressed') === 'true');
      viewer.go(poseAt(cur), states[cur], false);
    });
  }

  /* ---------- Celebration ---------- */
  function celebrate(msg) {
    const t = document.createElement('div');
    t.className = 'celebrate';
    t.innerHTML = `${I.check}<b>${esc(msg)}</b>`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    cv.width = innerWidth;
    cv.height = innerHeight;
    document.body.appendChild(cv);
    const g = cv.getContext('2d');
    const cols = ['#ffcc33', '#3b82f6', '#8ec5ff', '#ffe58a', '#2f6fde'];
    const ps = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4,
      r: Math.random() * Math.PI,
      c: cols[(Math.random() * cols.length) | 0],
    }));
    let f = 0;
    (function tick() {
      g.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => {
        p.vy += 0.45;
        p.x += p.vx;
        p.y += p.vy;
        p.r += 0.2;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        g.fillRect(-4, -2, 8, 4);
        g.restore();
      });
      if (++f < 120) requestAnimationFrame(tick);
      else cv.remove();
    })();
  }

  /* ---------- Search ----------
     One index over guides, versions, single steps, sections and every tool/material. Typing shows the
     best matches; Enter jumps straight to the top one; "See all" lists everything grouped. */
  const SYN = {
    leak: ['drip', 'leaking'], leaky: ['leak', 'drip'], drip: ['leak'], dripping: ['drip', 'leak'],
    clog: ['clogged', 'drain', 'slow'], clogged: ['clog', 'drain'], blocked: ['clog'],
    outlet: ['receptacle', 'plug'], plug: ['outlet'], socket: ['outlet'], receptacle: ['outlet'],
    ac: ['air', 'conditioner', 'condenser', 'cooling'], aircon: ['air', 'conditioner'], heat: ['furnace', 'heater'], heater: ['furnace', 'heat'],
    tyre: ['tire'], tires: ['tire'], wifi: ['wi-fi', 'router', 'network'], internet: ['network', 'router', 'wi-fi'],
    pc: ['computer'], laptop: ['computer'], fridge: ['refrigerator'], freezer: ['refrigerator'],
    bbq: ['grill'], barbecue: ['grill'], lamp: ['light'], light: ['fixture', 'bulb'], bulb: ['light'],
    car: ['auto', 'vehicle', 'engine'], truck: ['diesel', 'vehicle'], grass: ['lawn'], yard: ['lawn', 'backyard'],
    veggies: ['vegetable'], veggie: ['vegetable'], veg: ['vegetable'], plants: ['plant'], houseplant: ['indoor', 'plant'],
    hoop: ['basketball'], tent: ['camping'], campfire: ['fire'], pot: ['container'], planter: ['container', 'bed'],
    loo: ['toilet'], wc: ['toilet'], tap: ['faucet'], spigot: ['faucet', 'hose'], breaker: ['circuit', 'panel'],
    squeak: ['squeaky'], squeaky: ['squeak'], hole: ['patch'], crack: ['cracked', 'patch'],
  };
  const stem = (w) => (w.length > 4 ? w.replace(/(ings|ing|ies|es|ed|s)$/, (m) => (m === 'ies' ? 'y' : '')) : w);
  const STOP = new Set('a an the my is are it its to of on in at and or not no wont dont doesnt isnt cant how do i what why with for from your me keeps keep'.split(' '));
  const toks = (t) => String(t || '').toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9]+/).filter(Boolean).map(stem);
  const qtoks = (t) => {
    const all = toks(t);
    const kept = all.filter((w) => !STOP.has(w));
    return kept.length ? kept : all;
  };
  function ed1(a, b) {
    // true when a and b differ by at most one edit
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) (i++, j++);
      else {
        if (++e > 1) return false;
        if (a.length > b.length) i++;
        else if (a.length < b.length) j++;
        else (i++, j++);
      }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  let INDEX = null;
  let indexKey = '';
  function buildIndex() {
    const key = String(unlocked());
    if (INDEX && key === indexKey) return INDEX;
    indexKey = key;
    INDEX = [];
    const add = (o, fields) => {
      o.f = fields.map(([w, t]) => [w, new Set(toks(t))]);
      INDEX.push(o);
    };
    for (const c of visibleCats()) {
      add({ type: 'cat', c, title: c.name, sub: c.blurb, href: '#' + c.id }, [[6, c.name], [2, c.blurb]]);
      for (const r of c.repairs) {
        const base = '#' + c.id + '.' + r.id;
        add({ type: 'guide', c, r, title: r.title, sub: r.summary, href: base }, [
          [10, r.title], [4, c.name], [3, r.summary], [2, (r.variants || []).map((v) => v.name).join(' ')], [1, r.causes.map((x) => x.join(' ')).join(' ') + ' ' + r.tools.join(' ')],
        ]);
        const vs = r.variants || [];
        vs.forEach((v, vi) => {
          if (vi === 0 && !v.steps) return;
          add({ type: 'variant', c, r, v, title: v.name, sub: r.title, href: base + '@' + v.id }, [[8, v.name], [6, r.title], [3, v.blurb || ''], [1, v.summary || '']]);
        });
        const stepSets = [[null, r.steps]].concat(vs.filter((v) => v.steps).map((v) => [v, v.steps]));
        for (const [v, steps] of stepSets)
          steps.forEach((st, i) =>
            add({ type: 'step', c, r, v, title: st.t, sub: `Step ${i + 1} · ${r.title}${v ? ' (' + v.name + ')' : ''}`, href: base + (v ? '@' + v.id : '') + '~s' + (i + 1) }, [
              [6, st.t], [2, r.title], [1, st.d + ' ' + (st.tip || '')],
            ])
          );
      }
    }
    for (const [k, it] of Object.entries(TB.ITEMS || {})) add({ type: 'item', key: k, title: it.name, sub: it.what, href: '#item=' + k }, [[7, it.name], [1, it.what]]);
    return INDEX;
  }
  const TYPE_W = { guide: 1, variant: 0.92, cat: 0.85, step: 0.62, item: 0.45 };
  function search(term, limit) {
    const raw = qtoks(term);
    if (!raw.length) return [];
    const groups = raw.map((w) => [w].concat((SYN[w] || []).map(stem)));
    const phrase = term.toLowerCase().trim();
    const out = [];
    // Score with the words as typed; fall back to synonyms only for documents the typed words miss.
    const scoreWith = (d, useSyn) => {
      let score = 0, hit = 0;
      for (const g of groups) {
        let best = 0;
        for (const [w, set] of d.f)
          for (const q of useSyn ? g : g.slice(0, 1)) {
            if (set.has(q)) best = Math.max(best, w);
            else if (best < w * 0.7)
              for (const t of set) {
                if (q.length >= 3 && t.startsWith(q)) { best = Math.max(best, w * 0.7); break; }
                if (q.length >= 5 && ed1(q, t)) { best = Math.max(best, w * 0.5); break; }
              }
          }
        if (best) (hit++, (score += best));
      }
      // Every word should match; with 3+ words, allow one miss at a cost.
      if (hit === groups.length) return score;
      return groups.length >= 3 && hit >= groups.length - 1 ? score * 0.45 : 0;
    };
    for (const d of buildIndex()) {
      let score = scoreWith(d, false);
      if (!score) score = scoreWith(d, true) * 0.3;
      if (!score) continue;
      score *= TYPE_W[d.type];
      if (d.title.toLowerCase().includes(phrase)) score *= 1.5;
      out.push({ d, score });
    }
    out.sort((a, b) => b.score - a.score);
    return limit ? out.slice(0, limit) : out;
  }
  const TYPE_LABEL = { guide: 'Guide', variant: 'Version', step: 'Step', cat: 'Section', item: 'Tool & part' };
  const hitIcon = (d) => (d.type === 'item' ? I.wrench : d.c ? catIcon(d.c) : I.search);
  function goHit(d) {
    if (d.type === 'item') return showItem(d.key);
    if (location.hash === d.href) route();
    else location.hash = d.href;
  }
  // Attach the type-ahead to any search input.
  function attachSearch(input, opts) {
    const box = document.createElement('div');
    box.className = 'sugg';
    box.setAttribute('role', 'listbox');
    input.parentElement.appendChild(box);
    input.setAttribute('autocomplete', 'off');
    let hits = [], sel = 0;
    const close = () => ((box.innerHTML = ''), box.classList.remove('open'));
    const paint = () => {
      const term = input.value.trim();
      if (!term) return close();
      hits = search(term, 7);
      sel = 0;
      box.innerHTML = (hits.length
        ? hits.map(({ d }, i) => `<button type="button" class="sugg-row ${i === 0 ? 'on' : ''}" data-i="${i}" role="option"><span class="sugg-ico">${hitIcon(d)}</span><span class="sugg-txt"><b>${esc(d.title)}</b><small>${esc(d.sub || '')}</small></span><span class="sugg-type t-${d.type}">${TYPE_LABEL[d.type]}</span></button>`).join('')
        : `<div class="sugg-none">No exact match yet. Try a part name, like “faucet”, “tire” or “tomato”.</div>`) +
        `<button type="button" class="sugg-all" data-all="1">${I.search}See all results for “${esc(term)}”</button>`;
      box.classList.add('open');
    };
    const mark = () => $$('.sugg-row', box).forEach((b, i) => b.classList.toggle('on', i === sel));
    input.addEventListener('input', paint);
    input.addEventListener('focus', () => input.value.trim() && paint());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!hits.length) return;
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : hits.length - 1)) % hits.length;
        mark();
      } else if (e.key === 'Enter') {
        const term = input.value.trim();
        if (!term) return;
        e.preventDefault();
        if (!hits.length) hits = search(term, 7);
        close();
        input.blur();
        if (hits[sel]) goHit(hits[sel].d);
        else location.hash = 'find=' + encodeURIComponent(term);
        if (opts && opts.clear) input.value = '';
      } else if (e.key === 'Escape') close();
    });
    box.addEventListener('mousedown', (e) => e.preventDefault());
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const term = input.value.trim();
      close();
      input.blur();
      if (b.dataset.all) location.hash = 'find=' + encodeURIComponent(term);
      else goHit(hits[+b.dataset.i].d);
      if (opts && opts.clear) input.value = '';
    });
    input.addEventListener('blur', () => setTimeout(close, 150));
  }
  function renderSearch(term) {
    const all = search(term);
    // Prefer a guide, version or step as the best match unless a tool clearly wins.
    const best = all.find((h) => h.d.type !== 'item' && h.d.type !== 'cat' && h.score >= all[0].score * 0.5) || all[0];
    const byType = (t) => all.filter((h) => h.d.type === t);
    const row = ({ d }) => `<a class="hit" href="${esc(d.href)}" ${d.type === 'item' ? `data-info="${esc(d.key)}"` : ''}><span class="sugg-ico">${hitIcon(d)}</span><span class="sugg-txt"><b>${esc(d.title)}</b><small>${esc(d.sub || '')}</small></span><span class="sugg-type t-${d.type}">${TYPE_LABEL[d.type]}</span></a>`;
    const fOk = (h) => !h.d.r || passes(h.d.r, h.d.c);
    const guides = all.filter((h) => (h.d.type === 'guide' || h.d.type === 'variant') && fOk(h));
    const sec = (title, list, n) => (list.length ? `<section class="block"><div class="block-head"><h2>${title} <small>${list.length}</small></h2></div><div class="hits">${list.slice(0, n).map(row).join('')}</div></section>` : '');
    main.innerHTML = `<nav class="crumbs"><a href="#home">Home</a><span class="sep">/</span><span>Search</span></nav>
      <header class="page-head"><div><h1>Results for “${esc(term)}”</h1><p>${all.length ? `${all.length} matches across guides, steps and tools` : 'Nothing matched yet.'}</p></div></header>
      <label class="hero-search find-again">${I.search}<input id="fq" type="search" value="${esc(term)}" aria-label="Search again"></label>
      ${best ? `<section class="best"><span class="eyebrow">${I.bulb} Best match</span>${row(best)}</section>` : '<p class="empty">Try a simpler word or a part name, like “faucet”, “tire”, “breaker” or “tomato”.</p>'}
      ${filterBar([], () => renderSearch(term), guides.length)}${sec('Guides', guides, 30)}${sec('Specific steps', byType('step').filter(fOk), 20)}${sec('Tools & materials', byType('item'), 20)}${sec('Sections', byType('cat'), 10)}`;
    $$('.hit[data-info]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
    attachSearch($('#fq'));
    document.title = 'Search · Toolbox';
  }
  const q = $('#q');
  attachSearch(q, { clear: true });

  /* ---------- Start screen ---------- */
  const START_EX = { repair: ['Dripping faucet', 'Dead outlet', 'Flat tire'], build: ['Fire pit', 'Paver patio', 'Raised bed'], grow: ['Tomatoes', 'Herbs', 'Houseplants'] };
  function renderStart() {
    document.body.classList.add('is-start');
    const count = (k) => visibleCats().reduce((n, c) => n + c.repairs.filter((r) => kindOf(r, c) === k).length, 0);
    main.innerHTML = `<section class="start">
      <div class="start-glow" aria-hidden="true"></div>
      <div class="start-in">
        <span class="start-mark">${I.wrench}</span>
        <h1>What are we doing today?</h1>
        <p>Step-by-step guides with 3D walkthroughs, written for first-timers. Pick a path, or tell us what you need.</p>
        <label class="start-search">${I.search}<input id="sq" type="search" placeholder="Try “leaky faucet”, “flat tire” or “grow basil”" aria-label="Search everything"></label>
        <div class="start-doors">${KIND_IDS.map(
          (k, i) => `<a class="start-door kind-${k}" href="#mode.${k}" style="--i:${i}">
            <span class="sd-ico">${KIND_ICON[k]}</span>
            <span class="sd-txt"><b>${KINDS[k].one}</b><span>${KINDS[k].blurb}</span></span>
            <span class="sd-ex">${START_EX[k].map((x) => `<i>${esc(x)}</i>`).join('')}</span>
            <span class="sd-n">${count(k)} guides →</span>
          </a>`
        ).join('')}</div>
        <div class="start-links"><a class="start-skip" href="#all">Filter by time, cost or difficulty</a><a class="start-skip" href="#home">Browse everything</a></div>
      </div>
    </section>`;
    attachSearch($('#sq'));
    document.title = 'Toolbox';
  }

  /* ---------- Credits ---------- */
  function renderCredits() {
    main.innerHTML = `<header class="page-head"><div><h1>Credits</h1><p>The photo-scanned 3D models, surface textures and lighting come from <a href="https://polyhaven.com" target="_blank" rel="noopener">Poly Haven</a> and are released under CC0 (public domain). Thank you to the artists below.</p></div></header><div id="cred" class="cred">Loading…</div>`;
    fetch((window.TB_ASSET_BASE || 'assets/') + 'credits.json')
      .then((r) => r.json())
      .then((data) => {
        const rows = Object.entries(data).sort((a, b) => a[1].type.localeCompare(b[1].type) || a[1].name.localeCompare(b[1].name));
        $('#cred').innerHTML = `<table><thead><tr><th>Asset</th><th>Type</th><th>Author</th></tr></thead><tbody>${rows
          .map(([id, v]) => `<tr><td><a href="https://polyhaven.com/a/${id}" target="_blank" rel="noopener">${esc(v.name)}</a></td><td>${esc(v.type)}</td><td>${esc(v.authors.join(', '))}</td></tr>`)
          .join('')}</tbody></table>`;
      })
      .catch(() => ($('#cred').textContent = 'Credits list unavailable offline. All 3D assets are CC0 from polyhaven.com.'));
    document.title = 'Credits · Toolbox';
  }

  /* ---------- Router ---------- */
  function route() {
    teardown();
    const h = decodeURIComponent(location.hash.slice(1));
    $$('#domnav a').forEach((a) => a.classList.remove('on'));
    if (h === 'credits') return renderCredits();
    if (h === 'items') {
      const a = $('#domnav a[data-d="items"]');
      if (a) a.classList.add('on');
      return renderItems();
    }
    if (h === '') return renderStart();
    if (h === 'home') return renderHome();
    if (h === 'all' || h === 'find=') {
      const a = $('#domnav a[data-d="all"]');
      if (a) a.classList.add('on');
      return renderAll();
    }
    if (h.startsWith('find=')) return renderSearch(decodeURIComponent(h.slice(5)));
    if (/^mode\.(repair|build|grow)$/.test(h)) {
      const a = $(`#domnav a[data-d="${h}"]`);
      if (a) a.classList.add('on');
      return renderMode(h.slice(5));
    }
    if (h.startsWith('d.')) {
      const d = TB.DOMAINS.find((x) => x.id === h.slice(2));
      if (d) {
        const a = $(`#domnav a[data-d="${d.id}"]`);
        if (a) a.classList.add('on');
        return renderDomain(d);
      }
    }
    // Deep links: #cat.guide@variant~s3 opens that version at step 3.
    const m = h.match(/^([^.@~]+)(?:\.([^@~]+))?(?:@([^~]+))?(?:~s(\d+))?$/) || [];
    const [, cid, rid, dvid, dstep] = m;
    if (rid && dvid && byId[rid]) store.set('variant:' + rid, dvid);
    const c = visibleCats().find((x) => x.id === cid);
    if (c) {
      const a = $(`#domnav a[data-d="${c.domain}"]`);
      if (a) a.classList.add('on');
    }
    if (c && rid && byId[rid]) {
      renderRepair(c, byId[rid].rep);
      if (dstep) {
        const b = $(`[data-go="${dstep}"]`);
        const li = $('#s' + dstep);
        if (b) b.click();
        if (li) setTimeout(() => (li.scrollIntoView({ behavior: 'smooth', block: 'center' }), li.classList.add('flash')), 350);
      }
    }
    else if (c) renderCategory(c);
    else renderHome();
  }
  window.addEventListener('hashchange', () => {
    q.value = '';
    route();
    window.scrollTo(0, 0);
  });
  route();
})();
