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
  const kindOf = (r, c) => r.kind || (c && c.kind === 'project' ? 'build' : 'repair');
  const KINDS = { repair: { name: 'Repairs', one: 'repair', blurb: 'Fix what’s broken, worn out or not working right.' }, build: { name: 'Builds', one: 'build', blurb: 'Add onto what you have, or build something new from scratch.' } };
  const kindPill = (k) => `<span class="pill kind-${k}">${k === 'build' ? I.cube : I.wrench}${k === 'build' ? 'Build' : 'Repair'}</span>`;
  const splitByKind = (c) => ({ repair: c.repairs.filter((r) => kindOf(r, c) === 'repair'), build: c.repairs.filter((r) => kindOf(r, c) === 'build') });
  const countLine = (c) => {
    const s = splitByKind(c);
    return [s.repair.length ? `${s.repair.length} repair${s.repair.length > 1 ? 's' : ''}` : '', s.build.length ? `${s.build.length} build${s.build.length > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
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
    `<a href="#mode.repair" class="mode kind-repair" data-d="mode.repair">${I.wrench}Repairs</a><a href="#mode.build" class="mode kind-build" data-d="mode.build">${I.cube}Builds</a><a href="#items" class="mode kind-items" data-d="items">${I.wrench}Tools A–Z</a><span class="nav-sep"></span>` +
    TB.DOMAINS.filter((d) => TB.categories.some((c) => c.domain === d.id && !c.hidden))
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

    <section class="doors">${['repair', 'build']
      .map((k) => {
        const all = visibleCats().flatMap((c) => c.repairs.filter((r) => kindOf(r, c) === k).map((r) => ({ r, c })));
        return `<a class="door kind-${k}" href="#mode.${k}"><span class="door-ico">${k === 'build' ? I.cube : I.wrench}</span><div><h2>${k === 'build' ? 'Build something' : 'Fix something'}</h2><p>${KINDS[k].blurb}</p><span class="door-n">${all.length} guides →</span></div><ul>${all
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
    $$('.chip[data-q]').forEach((b) => b.addEventListener('click', () => ((q.value = b.dataset.q), q.dispatchEvent(new Event('input')))));
    const hq = $('#hq');
    hq.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && hq.value.trim()) ((q.value = hq.value), q.dispatchEvent(new Event('input')));
    });
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
    return ['repair', 'build']
      .filter((k) => s[k].length)
      .map((k) => `<div class="kind-group kind-${k}"><h3 class="kind-h">${k === 'build' ? I.cube : I.wrench}${KINDS[k].name}<small>${KINDS[k].blurb}</small></h3><div class="rep-list">${s[k].map((r) => repCard(r, c)).join('')}</div></div>`)
      .join('');
  }

  function renderDomain(d) {
    const cats = visibleCats().filter((c) => c.domain === d.id);
    main.innerHTML = `<nav class="crumbs"><a href="#">Home</a><span class="sep">/</span><span>${esc(d.name)}</span></nav>
      <header class="page-head d-${d.id}"><div><h1>${esc(d.name)}</h1><p>${esc(d.blurb)}</p></div></header>
      ${cats.map((c) => `<section class="block"><div class="block-head">${catIcon(c)}<h2><a href="#${c.id}">${esc(c.name)}</a></h2><p>${esc(c.blurb)}</p></div>${kindGroups(c)}</section>`).join('')}`;
    document.title = d.name + ' · Toolbox';
  }

  // All repairs, or all builds, across every section.
  function renderMode(k) {
    let html = `<nav class="crumbs"><a href="#">Home</a><span class="sep">/</span><span>${KINDS[k].name}</span></nav>
      <header class="page-head kind-${k}"><span class="cat-ico big kind-${k}">${k === 'build' ? I.cube : I.wrench}</span><div><h1>${KINDS[k].name}</h1><p>${KINDS[k].blurb}</p></div></header>`;
    for (const d of TB.DOMAINS) {
      const cats = visibleCats().filter((c) => c.domain === d.id && splitByKind(c)[k].length);
      if (!cats.length) continue;
      html += `<section class="block domain d-${d.id}"><div class="block-head"><h2>${esc(d.name)}</h2></div><div class="rep-list">${cats
        .flatMap((c) => splitByKind(c)[k].map((r) => repCard(r, c)))
        .join('')}</div></section>`;
    }
    main.innerHTML = html;
    document.title = KINDS[k].name + ' · Toolbox';
  }

  function renderCategory(c) {
    const d = domainOf(c);
    const dl = TB.DOMAINS.includes(d) ? `<a href="#d.${d.id}">${esc(d.name)}</a><span class="sep">/</span>` : '';
    main.innerHTML = `<nav class="crumbs"><a href="#">Home</a><span class="sep">/</span>${dl}<span>${esc(c.name)}</span></nav>${c.hidden ? '<p class="private-note">Only visible on this device. Tap the yellow wrench logo 5 times to hide it again.</p>' : ''}
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

    main.innerHTML = `<nav class="crumbs"><a href="#">Home</a><span class="sep">/</span><a href="#${c.id}">${esc(c.name)}</a><span class="sep">/</span><span>${esc(r.title)}</span></nav>
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
      <h2>${kindOf(base, c) === 'build' ? 'Pick your design' : 'Which one do you have?'}</h2>
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

        <section class="section box safety"><h2>${I.shield} Safety first</h2><ul>${r.safety.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>

        <section class="section"><h2>${kindOf(base, c) === 'build' ? 'Plan it' : 'Likely causes'}</h2><div class="causes">${r.causes
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
        if (doneSet.size === n && was < n) celebrate(kindOf(base, c) === 'build' ? 'Built it!' : 'Fixed it!');
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

  /* ---------- Search ---------- */
  const q = $('#q');
  function renderSearch(term) {
    const words = term.toLowerCase().trim().split(/\s+/);
    const hits = [];
    for (const c of visibleCats())
      for (const r of c.repairs) {
        const vtext = (r.variants || []).map((v) => v.name + ' ' + (v.blurb || '')).join(' ');
        const hay = [r.title, r.summary, c.name, vtext, ...r.causes.map((x) => x[0]), ...r.tools].join(' ').toLowerCase();
        if (words.every((w) => hay.includes(w))) hits.push({ c, r, score: words.every((w) => r.title.toLowerCase().includes(w)) ? 0 : 1 });
      }
    hits.sort((a, b) => a.score - b.score);
    main.innerHTML = `<header class="page-head"><div><h1>Results for “${esc(term)}”</h1><p>${hits.length} guide${hits.length === 1 ? '' : 's'}</p></div></header>
      ${hits.length ? `<div class="rep-list">${hits.map(({ c, r }) => repCard(r, c)).join('')}</div>` : '<p class="empty">Nothing matched. Try a part name like “faucet”, “tire” or “breaker”.</p>'}`;
  }
  q.addEventListener('input', () => {
    if (q.value.trim()) {
      teardown();
      renderSearch(q.value);
    } else route();
  });

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
    if (h === 'mode.repair' || h === 'mode.build') {
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
    const [cid, rid] = h.split('.');
    const c = visibleCats().find((x) => x.id === cid);
    if (c) {
      const a = $(`#domnav a[data-d="${c.domain}"]`);
      if (a) a.classList.add('on');
    }
    if (c && rid && byId[rid]) renderRepair(c, byId[rid].rep);
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
